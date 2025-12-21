// src/engine/types.ts

/**
 * NARRATIVE FRONT V2 - Type Definitions
 * Authoritative type system matching TDD v2.1
 */

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

export type VeracityLevel = 'True' | 'False' | 'Misleading';
export type SourceType = 'local_organic' | 'bot_network' | 'state_media';
export type ResponseType = 'IGNORE' | 'FACT_CHECK' | 'PRE_BUNK' | 'COUNTER_NARRATIVE' | 'DISCREDIT_SOURCE';
export type OutcomeType = 'success' | 'neutral' | 'failure';
export type GamePhase = 'START' | 'BRIEFING' | 'MODE_SELECTION' | 'GAME' | 'END';
export type GameMode = 'SCENARIO' | 'PROCEDURAL';

// ============================================================================
// INTELLIGENCE DATA
// ============================================================================

export interface IntelligenceData {
  hoursActive: number;           // 0-96+
  botAmplification: number;      // 0-100 (percentage)
  damagePotential: number;       // 1-10
  veracity: VeracityLevel;
  emotionalResonance: number;    // 1-10
  sourceType: SourceType;
}

// ============================================================================
// SCENARIO STRUCTURE
// ============================================================================

export interface ScenarioInject {
  primary: {
    theme: string;               // e.g., "scarcity", "atrocity"
    text: string;                // The adversary's narrative
    intelligence: IntelligenceData;
  };
  pivotThreshold?: number;       // For adaptive campaigns (future)
  compound?: boolean;            // Multi-vector attack
  secondaryThemes?: string[];    // For compound attacks
}

export interface FilterGuidance {
  briefing: {
    preInject: string;           // Filter's intro before seeing inject
    assessment: string;          // Filter's analysis of the threat
  };
  anticipationGuidance?: {
    text: string;                // Predictive guidance (future feature)
    hintPrimary: string | null;
    hintSecondary?: string | null;
  };
}

export interface ScenarioOutcomes {
  meterImpact: {
    success: number;             // e.g., +2
    neutral: number;             // e.g., 0
    failure: number;             // e.g., -2
  };
}

export interface Scenario {
  id: string;
  round: number;
  inject: ScenarioInject;
  filter: FilterGuidance;
  outcomes: ScenarioOutcomes;
}

// ============================================================================
// CAMPAIGN STRUCTURE
// ============================================================================

export interface CampaignMeta {
  version: string;
  title: string;
  description: string;
}

export interface CampaignMechanics {
  manpower: {
    starting: number;
    perRound: number;
    maximum: number;
  };
  costs: {
    anticipation_card: number;   // Deprecated in v2
    reaction_low: number;
    reaction_med: number;
    reaction_high: number;
  };
}

export interface Campaign {
  meta: CampaignMeta;
  mechanics: CampaignMechanics;
  scenarios: Scenario[];
}

// ============================================================================
// RESPONSE & OUTCOME DATA
// ============================================================================

export interface PlayerResponse {
  type: ResponseType;
  manpowerCost: number;
}

export interface RoundOutcome {
  meterShift: number;
  manpowerCost: number;
  outcomes: OutcomeNarrative[];  // Array of text snippets
  responses: ResponseType[];
  success: boolean;              // Did player succeed overall?
}

export interface OutcomeNarrative {
  text: string;
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface GameState {
  // Core State
  screen: GamePhase;
  gameMode: GameMode;
  scenarioId: string;
  
  // Progression
  round: number;                 // 0-5 (6 total rounds)
  meter: number;                 // -10 to +10
  manpower: number;              // Resets to 10 each round
  
  // History
  scenarioHistory: ScenarioRecord[];
  preBunksUsed: string[];        // Themes that have been pre-bunked
  
  // Actions
  resetGameState: () => void;
  advanceRound: () => number;
  updateMeter: (change: number) => void;
  spendManpower: (cost: number) => void;
  addManpower: (amount: number) => void;
  recordScenario: (scenario: Scenario, responses: PlayerResponse[], outcome: RoundOutcome) => ScenarioRecord;
  registerPreBunk: (theme: string) => void;
  hasPreBunkFor: (theme: string) => boolean;
  
  // Save/Load
  saveGame: () => boolean;
  loadGame: () => boolean;
  hasSavedGame: () => boolean;
  clearSavedGame: () => void;
  
  // Game State Queries
  getGameOutcome: () => 'victory' | 'defeat' | 'neutral';
  isGameOver: () => boolean;
}

export interface ScenarioRecord {
  round: number;
  scenarioId: string;
  inject: string;
  responses: PlayerResponse[];
  outcome: RoundOutcome;
  meterBefore: number;
  meterAfter: number;
  manpowerSpent: number;
  timestamp: string;
}

// ============================================================================
// UI STATE (Separate from Game State)
// ============================================================================

export interface UIState {
  isFrontopediaOpen: boolean;
  activeArticleId: string | null;
  openFrontopedia: (articleId?: string) => void;
  closeFrontopedia: () => void;
}