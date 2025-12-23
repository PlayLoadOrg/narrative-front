// src/engine/resolver.ts

import { RESPONSE_TYPES, PROBABILITY_CONFIG, OUTCOME_TYPES } from './constants';
import outcomesData from '../data/outcomes/outcomes.json';
import type { IntelligenceData, PlayerResponse, RoundOutcome, OutcomeType } from './types';

/**
 * NARRATIVE FRONT V2 - Outcome Resolver
 * Implements probability tables from TDD v2.1
 */

export class OutcomeCalculator {
  private outcomes = outcomesData;

  /**
   * Main calculation function
   * @param responses - Array of selected responses
   * @param intelligence - Current scenario intelligence data
   * @param preBunksUsed - Array of themes that have been pre-bunked
   * @param scenarioTheme - Current scenario's primary theme
   * @returns RoundOutcome with meter shift and narratives
   */
  calculateOutcome(
    responses: PlayerResponse[],
    intelligence: IntelligenceData,
    preBunksUsed: string[],
    scenarioTheme: string
  ): RoundOutcome {
    // Calculate total manpower cost
    const manpowerCost = this.calculateManpowerCost(responses);
    
    // Process each response
    const responseOutcomes = responses.map(response => {
      return this.processResponse(response, intelligence, preBunksUsed, scenarioTheme);
    });
    
    // Aggregate results
    let totalMeterShift = responseOutcomes.reduce((sum, outcome) => sum + outcome.shift, 0);
    const narratives = responseOutcomes.map(outcome => outcome.narrative);
    
    // Check for synergies or inefficiencies
    const synergy = this.checkSynergies(responses);
    if (synergy) {
      narratives.push(synergy.narrative);
      totalMeterShift += synergy.shift;
    }
    
    return {
      meterShift: Math.max(-5, Math.min(5, totalMeterShift)), // Bound to ±5
      manpowerCost,
      outcomes: narratives,
      responses: responses.map(r => r.type),
      success: totalMeterShift > 0
    };
  }

  /**
   * Calculate total manpower cost
   */
  private calculateManpowerCost(responses: PlayerResponse[]): number {
    return responses.reduce((total, response) => total + response.manpowerCost, 0);
  }

  /**
   * Process a single response using probability tables
   */
  private processResponse(
    response: PlayerResponse,
    intelligence: IntelligenceData,
    preBunksUsed: string[],
    scenarioTheme: string
  ): { shift: number; narrative: { text: string } } {
    const responseType = response.type;
    
    // Calculate success probability based on response type and intelligence
    let successChance = this.calculateSuccessProbability(
      responseType,
      response.manpowerCost,
      intelligence,
      preBunksUsed,
      scenarioTheme
    );
    
    // Add random variance (±5%)
    const variance = (Math.random() - 0.5) * PROBABILITY_CONFIG.VARIANCE * 2;
    successChance += variance;
    
    // Clamp to valid range
    successChance = Math.max(0.05, Math.min(0.95, successChance));
    
    // Determine outcome type
    const outcomeType = this.rollOutcome(successChance);
    
    // Check for critical outcomes (rare)
    const criticalRoll = Math.random();
    if (criticalRoll < PROBABILITY_CONFIG.CRITICAL_SUCCESS_CHANCE && outcomeType === OUTCOME_TYPES.SUCCESS) {
      return this.getCriticalOutcome(true);
    } else if (criticalRoll < PROBABILITY_CONFIG.CRITICAL_FAILURE_CHANCE && outcomeType === OUTCOME_TYPES.FAILURE) {
      return this.getCriticalOutcome(false);
    }
    
    // Get narrative text
    const narrative = this.selectNarrative(responseType, outcomeType);
    
    return {
      shift: narrative.shift,
      narrative: { text: narrative.text }
    };
  }

  /**
   * Calculate success probability based on response type and intelligence
   * Implements the probability table from TDD v2.1
   */
  private calculateSuccessProbability(
    responseType: string,
    manpowerCost: number,
    intel: IntelligenceData,
    preBunksUsed: string[],
    scenarioTheme: string
  ): number {
    let baseChance = 0.4; // Base probability
    
    // Apply response-specific modifiers
    switch (responseType) {
      case RESPONSE_TYPES.FACT_CHECK:
        baseChance = this.applyFactCheckModifiers(baseChance, manpowerCost, intel);
        break;
      
      case RESPONSE_TYPES.DISCREDIT_SOURCE:
        baseChance = this.applyDiscreditModifiers(baseChance, intel);
        break;
      
      case RESPONSE_TYPES.COUNTER_NARRATIVE:
        baseChance = this.applyCounterNarrativeModifiers(baseChance, intel);
        break;
      
      case RESPONSE_TYPES.PRE_BUNK:
        baseChance = this.applyPreBunkModifiers(baseChance, preBunksUsed, scenarioTheme);
        break;
      
      case RESPONSE_TYPES.IGNORE:
        baseChance = this.applyIgnoreModifiers(baseChance, intel);
        break;
    }
    
    return baseChance;
  }

  /**
   * Fact-Check modifiers (Hours Active is key)
   */
  private applyFactCheckModifiers(baseChance: number, cost: number, intel: IntelligenceData): number {
    let chance = baseChance;
    
    // Variable intensity based on cost (2-4 MP)
    if (cost === 3) {
      chance += 0.10;
    } else if (cost === 4) {
      chance += 0.20;
    }
    
    // Hours Active modifiers (from table)
    if (intel.hoursActive <= 12) {
      chance += 0.15; // Fresh narrative bonus
    } else if (intel.hoursActive >= 48 && intel.hoursActive < 96) {
      chance -= 0.15; // Hardened narrative penalty
    } else if (intel.hoursActive >= 96) {
      chance -= 0.30; // Deeply entrenched penalty
    }
    
    // Emotional Resonance penalty
    if (intel.emotionalResonance >= 7) {
      chance -= 0.15;
    }
    
    // Veracity modifiers
    if (intel.veracity === 'Misleading') {
      chance -= 0.10;
    } else if (intel.veracity === 'False') {
      chance += 0.05; // Easier to debunk outright lies
    }
    
    return chance;
  }

  /**
   * Discredit Source modifiers (Bot Amplification is key)
   */
  private applyDiscreditModifiers(baseChance: number, intel: IntelligenceData): number {
    let chance = baseChance;
    
    // Bot Amplification modifiers
    if (intel.botAmplification >= 60) {
      chance += 0.25; // High bot activity = easy target
    } else if (intel.botAmplification < 30) {
      chance -= 0.25; // Organic spread = backfire risk
    }
    
    // Source Type modifiers
    if (intel.sourceType === 'state_media') {
      chance += 0.20; // Easy to discredit state actors
    } else if (intel.sourceType === 'local_organic') {
      chance -= 0.30; // Risky to attack locals
    }
    
    return chance;
  }

  /**
   * Counter-Narrative modifiers (Emotional Resonance matters)
   */
  private applyCounterNarrativeModifiers(baseChance: number, intel: IntelligenceData): number {
    let chance = baseChance + 0.10; // Slight base bonus
    
    // Works better against emotional attacks
    if (intel.emotionalResonance >= 7) {
      chance += 0.15;
    }
    
    // Works better on hardened narratives (addresses underlying needs)
    if (intel.hoursActive >= 48) {
      chance += 0.10;
    }
    
    return chance;
  }

  /**
   * Pre-Bunk modifiers (Long-term investment)
   */
  private applyPreBunkModifiers(baseChance: number, preBunksUsed: string[], scenarioTheme: string): number {
    // Pre-bunking has modest immediate impact but creates future synergy
    let chance = baseChance;
    
    // If we've already pre-bunked this theme, bonus
    if (preBunksUsed.includes(scenarioTheme)) {
      chance += 0.20;
    }
    
    return chance;
  }

  /**
   * Ignore modifiers (Very situational)
   */
  private applyIgnoreModifiers(_baseChance: number, intel: IntelligenceData): number {
    // Ignore only works if narrative is dying naturally
    if (intel.emotionalResonance < 4 && intel.botAmplification < 30) {
      return 0.7; // High success if conditions are right
    } else {
      return 0.1; // Near-certain failure otherwise
    }
  }

  /**
   * Roll outcome based on probability
   */
  private rollOutcome(successChance: number): OutcomeType {
    const roll = Math.random();
    
    if (roll < successChance) {
      return OUTCOME_TYPES.SUCCESS;
    } else if (roll < successChance + 0.25) {
      return OUTCOME_TYPES.NEUTRAL; // 25% neutral buffer
    } else {
      return OUTCOME_TYPES.FAILURE;
    }
  }

  /**
   * Select narrative text from outcomes.json
   */
  private selectNarrative(responseType: string, outcomeType: OutcomeType): { shift: number; text: string } {
    const options = (this.outcomes as any)[responseType]?.[outcomeType];
    
    if (!options || options.length === 0) {
      console.warn(`No narrative found for ${responseType} - ${outcomeType}`);
      return { shift: 0, text: 'The situation evolves...' };
    }
    
    // Pick random narrative from available options
    const selected = options[Math.floor(Math.random() * options.length)];
    return selected;
  }

  /**
   * Get critical outcome (very rare, extra good/bad result)
   */
  private getCriticalOutcome(isSuccess: boolean): { shift: number; narrative: { text: string } } {
    const critical = isSuccess 
      ? (this.outcomes as any).CRITICAL_OUTCOMES.CRITICAL_SUCCESS
      : (this.outcomes as any).CRITICAL_OUTCOMES.CRITICAL_FAILURE;
    
    return {
      shift: critical.shift,
      narrative: { text: critical.text }
    };
  }

  /**
   * Check for synergies or inefficiencies between multiple responses
   */
  private checkSynergies(responses: PlayerResponse[]): { shift: number; narrative: { text: string } } | null {
    if (responses.length < 2) return null;
    
    const types = responses.map(r => r.type);
    
    // Pre-bunk + Fact-check synergy
    if (types.includes(RESPONSE_TYPES.PRE_BUNK) && types.includes(RESPONSE_TYPES.FACT_CHECK)) {
      return {
        shift: 1,
        narrative: { text: (this.outcomes as any).COMBINED.SYNERGY_PREBUNK_FACTCHECK.bonus }
      };
    }
    
    // Counter-narrative + Fact-check synergy
    if (types.includes(RESPONSE_TYPES.COUNTER_NARRATIVE) && types.includes(RESPONSE_TYPES.FACT_CHECK)) {
      return {
        shift: 1,
        narrative: { text: (this.outcomes as any).COMBINED.SYNERGY_COUNTER_FACTCHECK.bonus }
      };
    }
    
    // Fact-check + Discredit synergy (risky but powerful)
    if (types.includes(RESPONSE_TYPES.FACT_CHECK) && types.includes(RESPONSE_TYPES.DISCREDIT_SOURCE)) {
      return {
        shift: 0,
        narrative: { text: (this.outcomes as any).COMBINED.SYNERGY_FACTCHECK_DISCREDIT.bonus }
      };
    }
    
    // Multiple fact-checks (inefficient)
    const factCheckCount = types.filter(t => t === RESPONSE_TYPES.FACT_CHECK).length;
    if (factCheckCount > 1) {
      return {
        shift: -1,
        narrative: { text: (this.outcomes as any).COMBINED.INEFFICIENCY_MULTIPLE_FACTCHECKS.penalty }
      };
    }
    
    return null;
  }
}

export default OutcomeCalculator;