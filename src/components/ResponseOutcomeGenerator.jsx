// src/components/ResponseOutcomeGenerator.jsx

export class OutcomeCalculator {
  constructor(components) {
    this.components = components;
  }

  /**
   * Calculate outcome for player's response choices
   */
  calculateOutcome(scenario, playerChoices, gameState) {
    let totalMeterShift = 0;
    let totalManpowerCost = 0;
    let reputationChange = 0;
    let outcomes = [];

    // Handle IGNORE case
    if (playerChoices.length === 0) {
      return this._calculateIgnoreOutcome(scenario, gameState);
    }

    // Process each response
    for (const choice of playerChoices) {
      const outcome = this._calculateSingleResponse(
        choice, 
        scenario, 
        gameState
      );
      
      totalMeterShift += outcome.meterShift;
      totalManpowerCost += outcome.manpowerCost;
      reputationChange += outcome.reputationChange;
      outcomes.push(outcome);
    }

    // Synergy bonus for multiple responses
    if (playerChoices.length > 1) {
      const synergy = this._calculateSynergy(playerChoices, scenario);
      totalMeterShift += synergy.meterBonus;
      reputationChange += synergy.reputationBonus;
      outcomes.push({
        text: synergy.description,
        isSynergy: true
      });
    }

    // Intelligence accuracy revelation
    const impactRevelation = this._revealActualImpact(scenario, gameState);
    if (impactRevelation.surprise) {
      reputationChange += impactRevelation.reputationChange;
      outcomes.push({
        text: impactRevelation.text,
        isIntelligenceUpdate: true
      });
    }

    // Reward system (random bonus charges)
    const reward = this._calculateReward(playerChoices, totalMeterShift);
    
    return {
      meterShift: Math.max(-5, Math.min(5, totalMeterShift)),
      manpowerCost: totalManpowerCost,
      reputationChange,
      outcomes,
      reward,
      actualImpact: scenario.actualImpact,
      projectedImpact: scenario.intelligence.projectedImpact
    };
  }

  /**
   * Calculate outcome for single response
   */
  _calculateSingleResponse(choice, scenario, gameState) {
    const responseType = choice.type;
    const frame = this._getFrameById(scenario.components.frame);
    const evidence = this._getEvidenceById(scenario.components.evidence);
    
    // Base success probability
    let successChance = this._getBaseSuccessChance(
      responseType, 
      choice.rigor, 
      choice.card
    );

    // Modify by reputation
    const reputationModifier = (gameState.reputation / 100) * 0.2;
    successChance += reputationModifier;

    // Modify by scenario intelligence
    successChance -= (scenario.intelligence.salience / 100);
    
    // Modify by time delay
    const timeDecay = this._calculateTimeDecay(
      scenario.intelligence.hoursSinceAppearance,
      responseType
    );
    successChance -= timeDecay;

    // Check if response is effective/resistant for this scenario
    if (scenario.effectiveResponses.effective.includes(responseType) ||
        scenario.effectiveResponses.effective.includes(choice.rigor)) {
      successChance += 0.2;
    }
    if (scenario.effectiveResponses.resistant.includes(responseType) ||
        scenario.effectiveResponses.resistant.includes(choice.rigor)) {
      successChance -= 0.3;
    }

    // Clamp to 0-1 range
    successChance = Math.max(0.05, Math.min(0.95, successChance));

    // Roll for outcome
    const roll = Math.random();
    let outcomeType;
    
    if (roll < successChance * 0.6) {
      outcomeType = 'SUCCESS';
    } else if (roll < successChance) {
      outcomeType = 'NEUTRAL';
    } else {
      outcomeType = 'FAILURE';
    }

    // Check for backfire
    const backfire = this._checkBackfire(choice, outcomeType, scenario);
    if (backfire.occurred) {
      outcomeType = 'BACKFIRE';
    }

    return this._generateOutcome(
      responseType,
      outcomeType,
      choice,
      scenario,
      gameState,
      backfire
    );
  }

  _getBaseSuccessChance(responseType, rigor, card) {
    if (card) {
      const responseCard = this._getCardById(card);
      return responseCard?.effectiveness?.baseSuccess || 0.5;
    }

    const rigorData = this._getRigorData(responseType, rigor);
    return rigorData?.effectiveness?.baseSuccess || 0.5;
  }

  _calculateTimeDecay(hoursSince, responseType) {
    const decayRates = {
      'factcheck_basic': 0.1,
      'factcheck_thorough': 0.05,
      'factcheck_comprehensive': 0.02,
      'prebunk': 0,
      'counter_narrative': 0.03,
      'discredit_light': 0.08,
      'discredit_moderate': 0.06,
      'discredit_aggressive': 0.04
    };

    const rate = decayRates[responseType] || 0.05;
    return Math.min(0.4, hoursSince * rate);
  }

  _checkBackfire(choice, outcomeType, scenario) {
    let canBackfire = false;
    let backfireChance = 0;
    let backfireDamage = 0;

    if (choice.card) {
      const card = this._getCardById(choice.card);
      canBackfire = card?.risks?.canBackfire || false;
      backfireChance = card?.risks?.backfireChance || 0;
      backfireDamage = card?.risks?.backfireDamage || -2;
    } else if (choice.rigor) {
      const rigor = this._getRigorData(choice.type, choice.rigor);
      canBackfire = rigor?.risks?.canBackfire || false;
      backfireChance = rigor?.risks?.backfireChance || 0;
      backfireDamage = rigor?.risks?.backfireDamage || -1;
    }

    if (!canBackfire) {
      return { occurred: false };
    }

    if (outcomeType === 'FAILURE') {
      backfireChance *= 2;
    }

    const backfired = Math.random() < backfireChance;
    
    return {
      occurred: backfired,
      damage: backfireDamage,
      description: this._getBackfireDescription(choice, scenario)
    };
  }

  _generateOutcome(responseType, outcomeType, choice, scenario, gameState, backfire) {
    let meterShift = 0;
    let reputationChange = 0;
    let text = '';

    if (outcomeType === 'BACKFIRE') {
      meterShift = backfire.damage;
      reputationChange = backfire.damage * 2;
      text = backfire.description;
    } else {
      const templates = this._getOutcomeTemplates(responseType, outcomeType);
      text = templates[Math.floor(Math.random() * templates.length)];
      
      const shifts = {
        'SUCCESS': { meter: 2, reputation: 5 },
        'NEUTRAL': { meter: 0, reputation: 0 },
        'FAILURE': { meter: -1, reputation: -3 }
      };
      
      meterShift = shifts[outcomeType].meter;
      reputationChange = shifts[outcomeType].reputation;
    }

    const impactMultiplier = scenario.actualImpact / 5;
    meterShift = Math.round(meterShift * impactMultiplier);

    return {
      responseType: choice.type,
      outcomeType,
      meterShift,
      reputationChange,
      manpowerCost: choice.manpower,
      text,
      card: choice.card,
      rigor: choice.rigor
    };
  }

  _calculateSynergy(choices, scenario) {
    const hasFactCheck = choices.some(c => c.type.includes('factcheck'));
    const hasCounter = choices.some(c => c.type === 'counter_narrative');
    const hasDiscredit = choices.some(c => c.type.includes('discredit'));
    const hasPrebunk = choices.some(c => c.type === 'prebunk');

    let meterBonus = 0;
    let reputationBonus = 0;
    let description = '';

    if (hasFactCheck && hasCounter) {
      meterBonus += 1;
      reputationBonus += 3;
      description = '✓ SYNERGY: Debunking false claim while promoting true narrative created comprehensive response.';
    }

    if (hasDiscredit && hasFactCheck) {
      meterBonus += 1;
      reputationBonus += 2;
      description = '✓ SYNERGY: Attacking source credibility while providing evidence maximized impact.';
    }

    if (choices.length >= 3) {
      meterBonus += 1;
      reputationBonus += 2;
      description = '✓ SYNERGY: Multi-vector response overwhelmed adversary narrative.';
    }

    if (hasPrebunk && scenario.intelligence.hoursSinceAppearance > 6) {
      meterBonus -= 1;
      reputationBonus -= 3;
      description = '⚠ INEFFICIENCY: Pre-bunking after narrative already spread wasted resources.';
    }

    return { meterBonus, reputationBonus, description };
  }

  _calculateIgnoreOutcome(scenario, gameState) {
    const salience = scenario.intelligence.salience;
    const actualImpact = scenario.actualImpact;

    if (salience <= 3 && actualImpact <= 4) {
      if (Math.random() < 0.7) {
        return {
          meterShift: 0,
          manpowerCost: 0,
          reputationChange: 1,
          outcomes: [{
            text: 'IGNORE: The narrative was too absurd to gain traction and faded naturally. Resources conserved.',
            outcomeType: 'SUCCESS'
          }],
          reward: null,
          actualImpact,
          projectedImpact: scenario.intelligence.projectedImpact
        };
      }
    }

    if (salience >= 7 || actualImpact >= 7) {
      return {
        meterShift: Math.round(-actualImpact * 0.6),
        manpowerCost: 0,
        reputationChange: -5,
        outcomes: [{
          text: 'IGNORE: Your silence was interpreted as admission. The narrative went viral and caused severe damage to credibility and cohesion.',
          outcomeType: 'FAILURE'
        }],
        reward: null,
        actualImpact,
        projectedImpact: scenario.intelligence.projectedImpact
      };
    }

    return {
      meterShift: Math.round(-actualImpact * 0.3),
      manpowerCost: 0,
      reputationChange: -2,
      outcomes: [{
        text: 'IGNORE: The narrative didn\'t explode but continues to simmer in certain communities, creating background doubt.',
        outcomeType: 'NEUTRAL'
      }],
      reward: null,
      actualImpact,
      projectedImpact: scenario.intelligence.projectedImpact
    };
  }

  _revealActualImpact(scenario, gameState) {
    const projected = scenario.intelligence.projectedImpact;
    const actual = scenario.actualImpact;
    const difference = Math.abs(actual - projected);

    if (difference <= 1) {
      return { surprise: false };
    }

    let text = '';
    let reputationChange = 0;

    if (actual > projected) {
      const severity = actual - projected;
      text = `⚠️ INTELLIGENCE FAILURE: This inject's actual impact (${actual}/10) was ${severity > 3 ? 'significantly' : 'notably'} worse than intelligence projected (${projected}/10). The adversary's reach was underestimated.`;
      reputationChange = -Math.min(5, severity);
    } else {
      const overestimation = projected - actual;
      text = `ℹ️ INTELLIGENCE UPDATE: This inject's actual impact (${actual}/10) was lower than projected (${projected}/10). The threat was overestimated${overestimation > 3 ? ' - resources could have been conserved' : ''}.`;
      reputationChange = overestimation > 3 ? -1 : 0;
    }

    return {
      surprise: true,
      text,
      reputationChange,
      difference
    };
  }

  _calculateReward(choices, totalMeterShift) {
    if (totalMeterShift >= 3 && choices.length >= 2) {
      if (Math.random() < 0.3) {
        return {
          type: Math.random() < 0.5 ? 'prebunk' : 'counter_narrative',
          text: ' (Reward: +1 charge for effective multi-vector response)'
        };
      }
    }
    return null;
  }

  _getFrameById(id) {
    return this.components.narrativeFrames.find(f => f.id === id);
  }

  _getEvidenceById(id) {
    return this.components.evidenceTypes.find(e => e.id === id);
  }

  _getCardById(id) {
    return this.components.prebunks?.find(c => c.id === id) ||
           this.components.counterNarratives?.find(c => c.id === id);
  }

  _getRigorData(type, rigor) {
    if (type.includes('factcheck')) {
      return this.components.factCheckRigors?.find(r => r.id === `fc_${rigor}`);
    }
    if (type.includes('discredit')) {
      return this.components.discreditRigors?.find(r => r.id === `ds_${rigor}`);
    }
    return null;
  }

  _getOutcomeTemplates(responseType, outcomeType) {
    const templates = {
      'factcheck': {
        'SUCCESS': ['Your rapid fact-check was picked up by credible media, effectively neutralizing the claim.'],
        'NEUTRAL': ['The fact-check circulated among experts but failed to penetrate social media bubbles.'],
        'FAILURE': ['Your fact-check was too slow or technical. The adversary spun it as propaganda.']
      },
      'prebunk': {
        'SUCCESS': ['Your prior warnings paid off. The attempt was widely recognized as hostile propaganda and dismissed.'],
        'FAILURE': ['Despite warnings, the narrative was compelling enough to take root. Pre-bunking had minimal effect.']
      },
      'counter_narrative': {
        'SUCCESS': ['Your positive stories completely shifted media focus, drowning out the adversary narrative.'],
        'NEUTRAL': ['Your messaging was well-received but didn\'t directly address the hostile claim.'],
        'FAILURE': ['Your counter-narrative was perceived as changing the subject and made you appear evasive.']
      },
      'discredit': {
        'SUCCESS': ['You successfully exposed the source as a known disinformation agent with hostile ties.'],
        'NEUTRAL': ['While you proved the source unreliable, the message had detached from the messenger.'],
        'FAILURE': ['Your attack backfired spectacularly, creating a martyr and making you look defensive.']
      }
    };

    const baseType = responseType.split('_')[0];
    return templates[baseType]?.[outcomeType] || ['The response had mixed results.'];
  }

  _getBackfireDescription(choice, scenario) {
    return `BACKFIRE: Your response was exposed as flawed/inappropriate, significantly damaging credibility and strengthening the adversary narrative.`;
  }
}