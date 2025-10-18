// src/components/ScenarioGenerator.jsx

export class ScenarioGenerator {
  constructor(components) {
    this.components = components;
    this.previousScenarios = [];
    this.usedCombinations = new Set();
  }

  /**
   * Main generation function
   */
  generateScenario(round, difficulty, gameState) {
    let scenario;
    let attempts = 0;
    const maxAttempts = 20;

    // Generate until we get a valid, non-repetitive scenario
    do {
      scenario = this._assembleScenario(round, difficulty, gameState);
      attempts++;
    } while (
      !this._validateScenario(scenario) && 
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      console.warn('Max generation attempts reached, using best available');
    }

    this.previousScenarios.push(scenario);
    if (this.previousScenarios.length > 10) {
      this.previousScenarios.shift(); // Keep last 10 for variety checking
    }

    return scenario;
  }

  /**
   * Core assembly logic
   */
  _assembleScenario(round, difficulty, gameState) {
    // 1. Determine threat level from difficulty curve
    const threatLevel = this._calculateThreatLevel(round, difficulty);

    // 2. Select compatible components
    const actor = this._selectThreatActor(threatLevel, gameState);
    const frame = this._selectNarrativeFrame(actor, threatLevel, gameState);
    const evidence = this._selectEvidence(actor?.sophistication || 'medium', frame);
    const platform = this._selectPlatform(actor, evidence, threatLevel);

    // SAFETY CHECK - if any component is null, log and use defaults
    if (!actor || !frame || !evidence || !platform) {
      console.error('Component selection failed:', { actor, frame, evidence, platform });
      console.error('Available components:', {
        actorCount: this.components.threatActors?.length,
        frameCount: this.components.narrativeFrames?.length,
        evidenceCount: this.components.evidenceTypes?.length,
        platformCount: this.components.platforms?.length
      });
      
      // Return a safe default scenario
      return {
        id: `fallback_${Date.now()}`,
        inject: "A disinformation narrative has emerged on social media claiming NATO operations have hidden objectives.",
        intelligence: {
          salience: 5,
          projectedImpact: 5,
          sourceNotoriety: 5,
          hoursSinceAppearance: 2
        },
        actualImpact: 5,
        components: {
          actor: 'state_media_outlet',
          frame: 'secret_agenda',
          evidence: 'fake_photo',
          platform: 'social_media'
        },
        effectiveResponses: {
          effective: ['factcheck_thorough'],
          resistant: ['ignore'],
          neutral: []
        },
        metadata: {
          threatLevel: 5,
          round,
          generatedAt: new Date().toISOString(),
          isFallback: true
        }
      };
    }

    // 3. Calculate intelligence metrics
    const intelligence = this._calculateIntelligence(
      actor, frame, evidence, platform, round, gameState
    );

    // 4. Generate narrative text
    const inject = this._generateNarrative(actor, frame, evidence, platform);

    // 5. Determine effective responses based on components
    const effectiveResponses = this._determineEffectiveResponses(frame, evidence);

    // 6. Calculate hidden actual impact
    const { projected, actual } = this._calculateImpactWithUncertainty(
      intelligence.projectedImpact,
      frame,
      gameState.reputation
    );

    return {
      id: `generated_${Date.now()}_${Math.random()}`,
      inject,
      intelligence: {
        ...intelligence,
        projectedImpact: projected
      },
      actualImpact: actual,
      components: {
        actor: actor.id,
        frame: frame.id,
        evidence: evidence.id,
        platform: platform.id
      },
      effectiveResponses,
      metadata: {
        threatLevel,
        round,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Threat level calculation with difficulty curve
   */
  _calculateThreatLevel(round, difficulty) {
    const baseThreat = Math.min(10, 3 + (round * 0.5) + difficulty);
    const variance = Math.random() * 2 - 1; // -1 to +1
    return Math.max(1, Math.min(10, baseThreat + variance));
  }

  /**
   * Select threat actor based on threat level
   */
  _selectThreatActor(threatLevel, gameState) {
    const candidates = this.components.threatActors.filter(actor => {
      const minNotoriety = actor.notorietyRange[0];
      const maxNotoriety = actor.notorietyRange[1];
      const avgNotoriety = (minNotoriety + maxNotoriety) / 2;
      
      // Actor should match threat level (+/- 3 tolerance)
      return Math.abs(avgNotoriety - threatLevel) <= 3;
    });

    // Avoid repeating same actor type recently
    const recentActors = this.previousScenarios
      .slice(-3)
      .map(s => s.components.actor);
    
    const freshCandidates = candidates.filter(
      a => !recentActors.includes(a.id)
    );

    const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Select narrative frame compatible with actor
   */
  _selectNarrativeFrame(actor, threatLevel, gameState) {
    let candidates = this.components.narrativeFrames;

    if (!candidates || candidates.length === 0) {
      console.error('No narrative frames available in components');
      return null;
    }

    // Filter to actor's preferred frames if specified
    if (actor.preferredFrames && actor.preferredFrames.length > 0 && !actor.preferredFrames.includes('all')) {
      const preferred = candidates.filter(f => 
        actor.preferredFrames.includes(f.id)
      );
      if (preferred.length > 0) candidates = preferred;
    }

    // Filter by appropriate impact level for threat level
    candidates = candidates.filter(frame => {
      const avgImpact = (frame.projectedImpactRange[0] + frame.projectedImpactRange[1]) / 2;
      return Math.abs(avgImpact - threatLevel) <= 3;
    });

    // If filtering removed all candidates, use all frames
    if (candidates.length === 0) {
      console.warn('No frames matched filters, using all frames');
      candidates = this.components.narrativeFrames;
    }

    // Avoid recent frames
    const recentFrames = this.previousScenarios
      .slice(-4)
      .map(s => s.components?.frame)
      .filter(Boolean);
    
    const freshCandidates = candidates.filter(
      f => !recentFrames.includes(f.id)
    );

    const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
    
    // Return random frame from pool
    const selectedFrame = pool[Math.floor(Math.random() * pool.length)];
    
    if (!selectedFrame) {
      console.error('Failed to select a frame');
    }
    
    return selectedFrame;
  }

  /**
   * Select evidence type matching sophistication
   */
  _selectEvidence(sophisticationLevel, frame) {
    const sophisticationMap = {
      'low': ['fake_photo', 'anonymous_testimony'],
      'medium': ['fake_document', 'out_of_context_real_footage', 'expert_impersonation'],
      'high': ['deepfake_video', 'data_manipulation', 'out_of_context_real_footage'],
      'very_high': ['deepfake_video', 'data_manipulation', 'fake_document']
    };

    const appropriateTypes = sophisticationMap[sophisticationLevel] || 
                            sophisticationMap['medium'];
    
    const candidates = this.components.evidenceTypes.filter(e =>
      appropriateTypes.includes(e.id)
    );

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Select platform based on actor and evidence
   */
  _selectPlatform(actor, evidence, threatLevel) {
    let candidates = this.components.platforms;

    // Filter to actor's typical platforms
    if (actor.typicalPlatforms && actor.typicalPlatforms.length > 0) {
      const typical = candidates.filter(p =>
        actor.typicalPlatforms.includes(p.id) ||
        actor.typicalPlatforms.includes('all')
      );
      if (typical.length > 0) candidates = typical;
    }

    // High threat scenarios more likely to hit mainstream
    if (threatLevel >= 8) {
      const mainstream = candidates.filter(p => 
        p.id === 'mainstream_pickup' || 
        p.id === 'coordinated_multi_platform'
      );
      if (mainstream.length > 0 && Math.random() < 0.4) {
        return mainstream[Math.floor(Math.random() * mainstream.length)];
      }
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Calculate all intelligence metrics
   */
  _calculateIntelligence(actor, frame, evidence, platform, round, gameState) {
    // ADD NULL CHECKS
    if (!frame || !evidence || !platform || !actor) {
      console.error('Missing component:', { frame, evidence, platform, actor });
      // Return default values if components are missing
      return {
        salience: 5,
        projectedImpact: 5,
        sourceNotoriety: 5,
        hoursSinceAppearance: 2
      };
    }

    // Salience calculation
    const baseSalience = 3 + (round * 0.3);
    const salience = Math.min(10, Math.max(1, 
      baseSalience * evidence.salienceMultiplier * platform.salienceMultiplier +
      (Math.random() * 2 - 1) // variance
    ));

    // Projected Impact from frame
    const [minImpact, maxImpact] = frame.projectedImpactRange || [3, 7];
    const baseImpact = minImpact + Math.random() * (maxImpact - minImpact);
    const projectedImpact = Math.min(10, Math.max(1, Math.round(baseImpact)));

    // Source Notoriety from actor
    const [minNotoriety, maxNotoriety] = actor.notorietyRange || [3, 7];
    let sourceNotoriety = minNotoriety + Math.random() * (maxNotoriety - minNotoriety);
    
    // Adjust based on game state (reputation affects intelligence quality)
    if (gameState.reputation > 70) {
      sourceNotoriety += 1; // Better intel
    } else if (gameState.reputation < 30) {
      sourceNotoriety -= 1; // Worse intel
    }
    sourceNotoriety = Math.min(10, Math.max(1, Math.round(sourceNotoriety)));

    // Hours since appearance based on platform speed
    const [minHours, maxHours] = platform.timeToAppearanceRange || [1, 6];
    let hoursSinceAppearance = minHours + Math.random() * (maxHours - minHours);
    
    // Viral content appears more recent
    if (evidence.spreadSpeed === 'viral' || platform.spreadSpeed === 'viral') {
      hoursSinceAppearance *= 0.5;
    }
    hoursSinceAppearance = Math.max(0.25, hoursSinceAppearance);

    return {
      salience: Math.round(salience),
      projectedImpact,
      sourceNotoriety,
      hoursSinceAppearance: Math.round(hoursSinceAppearance * 4) / 4 // Round to 0.25
    };
  }

  /**
   * Calculate actual impact with uncertainty
   */
  _calculateImpactWithUncertainty(projectedImpact, frame, reputation) {
    const baseVariance = frame.actualImpactVariance || 0.25;
    
    // Reputation affects intelligence accuracy
    const reputationFactor = reputation > 70 ? 0.8 : 
                            reputation < 30 ? 1.3 : 1.0;
    
    const variance = baseVariance * reputationFactor;
    
    const roll = Math.random();
    let actual;

    if (roll < 0.6) {
      // 60%: Mostly accurate
      actual = projectedImpact + Math.round((Math.random() * 2 - 1) * variance);
    } else if (roll < 0.85) {
      // 25%: Worse than expected
      actual = projectedImpact + Math.ceil((2 + Math.random() * 3) * variance);
    } else {
      // 15%: Better than expected
      actual = projectedImpact - Math.ceil((2 + Math.random() * 2) * variance);
    }

    return {
      projected: Math.max(1, Math.min(10, projectedImpact)),
      actual: Math.max(1, Math.min(10, actual))
    };
  }

  /**
   * Generate narrative text from components
   */
  _generateNarrative(actor, frame, evidence, platform) {
    // ADD NULL CHECK at the very start
    if (!frame || !frame.textTemplates || frame.textTemplates.length === 0) {
      console.error('Invalid frame for narrative generation:', {
        frameExists: !!frame,
        frameId: frame?.id,
        hasTemplates: !!frame?.textTemplates,
        templateCount: frame?.textTemplates?.length
      });
      
      // Return safe default instead of crashing
      return `A disinformation narrative has emerged from ${actor?.name || 'an unknown source'} via ${platform?.name || 'social media'}.`;
    }

    // Select random template from frame
    const template = frame.textTemplates[
      Math.floor(Math.random() * frame.textTemplates.length)
    ];

    // Fill template with vocabulary
    let narrative = template;
    const vocab = this.components.vocabularySlots;

    if (!vocab) {
      console.error('Vocabulary slots not available!');
      return template; // Return template as-is
    }

    // Replace all placeholder slots
    narrative = narrative.replace(/{(\w+)}/g, (match, slot) => {
      if (vocab[slot]) {
        return vocab[slot][Math.floor(Math.random() * vocab[slot].length)];
      }
      
      // Handle special slots
      switch(slot) {
        case 'evidence_type':
          return this._evidenceToText(evidence);
        case 'target':
          return vocab.actors ? vocab.actors[Math.floor(Math.random() * vocab.actors.length)] : 'military forces';
        case 'actor':
          return vocab.actors ? vocab.actors[Math.floor(Math.random() * vocab.actors.length)] : 'NATO troops';
        case 'source':
          return actor?.name || 'unknown sources';
        case 'platform':
          return platform?.name || 'social media';
        case 'harmful_action':
          return vocab.actions_harmful ? vocab.actions_harmful[Math.floor(Math.random() * vocab.actions_harmful.length)] : 'taking supplies';
        case 'consequence':
          return vocab.consequences ? vocab.consequences[Math.floor(Math.random() * vocab.consequences.length)] : 'hardship';
        case 'secret_action':
          return vocab.secret_actions ? vocab.secret_actions[Math.floor(Math.random() * vocab.secret_actions.length)] : 'planning secret operations';
        case 'hidden_objective':
          return vocab.secret_actions ? vocab.secret_actions[Math.floor(Math.random() * vocab.secret_actions.length)] : 'establishing control';
        case 'ally_nation':
          return vocab.ally_nations ? vocab.ally_nations[Math.floor(Math.random() * vocab.ally_nations.length)] : 'an allied nation';
        case 'dissent_action':
          return vocab.dissent_actions ? vocab.dissent_actions[Math.floor(Math.random() * vocab.dissent_actions.length)] : 'expressing concerns';
        case 'environmental_impact':
          return vocab.environmental_impacts ? vocab.environmental_impacts[Math.floor(Math.random() * vocab.environmental_impacts.length)] : 'environmental damage';
        case 'offensive_action':
          return vocab.offensive_actions ? vocab.offensive_actions[Math.floor(Math.random() * vocab.offensive_actions.length)] : 'disrespecting local customs';
        case 'war_crime_type':
          return vocab.war_crime_types ? vocab.war_crime_types[Math.floor(Math.random() * vocab.war_crime_types.length)] : 'violation of engagement rules';
        case 'security_failure':
          return vocab.security_failures ? vocab.security_failures[Math.floor(Math.random() * vocab.security_failures.length)] : 'security breach';
        case 'number':
          return vocab.numbers ? vocab.numbers[Math.floor(Math.random() * vocab.numbers.length)] : 'several';
        case 'operation':
          return 'the exercise';
        case 'real_purpose':
          return vocab.secret_actions ? vocab.secret_actions[Math.floor(Math.random() * vocab.secret_actions.length)] : 'hidden objectives';
        case 'incident_type':
          return 'The incident';
        case 'impact_state':
          return 'affected';
        case 'concern_type':
          return vocab.dissent_actions ? vocab.dissent_actions[Math.floor(Math.random() * vocab.dissent_actions.length)] : 'concerns';
        case 'issue':
          return 'the operation';
        case 'activity':
          return 'military activities';
        case 'damage_type':
          return vocab.environmental_impacts ? vocab.environmental_impacts[Math.floor(Math.random() * vocab.environmental_impacts.length)] : 'damage';
        case 'ecological_consequence':
          return vocab.environmental_impacts ? vocab.environmental_impacts[Math.floor(Math.random() * vocab.environmental_impacts.length)] : 'ecological impact';
        case 'sacred_location':
          return vocab.locations ? vocab.locations[Math.floor(Math.random() * vocab.locations.length)] : 'a sacred site';
        case 'disrespectful_behavior':
          return vocab.offensive_actions ? vocab.offensive_actions[Math.floor(Math.random() * vocab.offensive_actions.length)] : 'inappropriate behavior';
        case 'cultural_event':
          return 'a religious ceremony';
        case 'incident':
          return 'the incident';
        case 'financial_misconduct':
          return 'financial impropriety';
        case 'corruption_type':
          return 'questionable financial dealings';
        case 'financial_claim':
          return 'suspicious financial transactions';
        case 'violation':
          return vocab.war_crime_types ? vocab.war_crime_types[Math.floor(Math.random() * vocab.war_crime_types.length)] : 'violations';
        case 'classified_information':
          return 'classified operational data';
        case 'sensitive_operation_detail':
          return 'sensitive operational information';
        default:
          console.warn(`Unknown placeholder: ${slot}`);
          return match; // Leave unchanged if no match
      }
    });

    // Add platform context
    const platformPrefix = this._getPlatformPrefix(platform);
    return `${platformPrefix}${narrative}`;
  }

  _evidenceToText(evidence) {
    const map = {
      'fake_photo': 'A photo circulating online',
      'deepfake_video': 'A highly convincing video',
      'fake_document': 'A leaked document',
      'anonymous_testimony': 'Anonymous sources claim',
      'out_of_context_real_footage': 'Viral footage',
      'data_manipulation': 'Published statistics',
      'expert_impersonation': 'An alleged expert states'
    };
    return map[evidence.id] || 'Reports suggest';
  }

  _getPlatformPrefix(platform) {
    const map = {
      'social_media': 'Trending on social media: ',
      'adversary_news': 'Breaking on adversary outlets: ',
      'messaging_apps': 'Spreading via encrypted channels: ',
      'mainstream_pickup': 'BREAKING NEWS: ',
      'local_news': 'Local media reports: ',
      'blog_website': 'Emerging online: ',
      'coordinated_multi_platform': 'COORDINATED CAMPAIGN: '
    };
    return map[platform.id] || '';
  }

  /**
   * Determine which responses are effective against this scenario
   */
  _determineEffectiveResponses(frame, evidence) {
    const effective = [...(frame.vulnerableToResponses || [])];
    
    // Evidence-specific vulnerabilities
    if (evidence.vulnerableToFactCheck) {
      if (evidence.factCheckDifficulty === 'easy') {
        effective.push('factcheck_basic');
      }
      effective.push('factcheck_thorough');
      if (evidence.factCheckDifficulty === 'hard') {
        effective.push('factcheck_comprehensive');
      }
    }

    // Frames resistant to certain responses
    const resistant = frame.resistantToResponses || [];
    
    return {
      effective: [...new Set(effective)], // Remove duplicates
      resistant: resistant,
      neutral: this._calculateNeutralResponses(effective, resistant)
    };
  }

  _calculateNeutralResponses(effective, resistant) {
    const allResponses = [
      'factcheck_basic', 'factcheck_thorough', 'factcheck_comprehensive',
      'prebunk', 'ignore', 'counter_narrative', 
      'discredit_light', 'discredit_moderate', 'discredit_aggressive'
    ];
    
    return allResponses.filter(r => 
      !effective.includes(r) && !resistant.includes(r)
    );
  }

  /**
   * Validation checks for generated scenario
   */
  _validateScenario(scenario) {
    // 1. Coherence check - does narrative make sense?
    if (!scenario.inject || scenario.inject.includes('undefined') || scenario.inject.includes('{')) {
      console.warn('Validation failed: Incomplete narrative template');
      return false;
    }

    // 2. Metrics bounds check
    const intel = scenario.intelligence;
    if (intel.salience < 1 || intel.salience > 10 ||
        intel.projectedImpact < 1 || intel.projectedImpact > 10 ||
        intel.sourceNotoriety < 1 || intel.sourceNotoriety > 10) {
      console.warn('Validation failed: Metrics out of bounds');
      return false;
    }

    // 3. Variety check - not too similar to recent scenarios
    const combinationKey = `${scenario.components.actor}_${scenario.components.frame}`;
    if (this.usedCombinations.has(combinationKey)) {
      // Allow reuse after 5 scenarios
      const recentCombos = Array.from(this.usedCombinations).slice(-5);
      if (recentCombos.includes(combinationKey)) {
        console.warn('Validation failed: Recent combination reused');
        return false;
      }
    }
    this.usedCombinations.add(combinationKey);

    // 4. Winnability check - at least some responses should be effective
    if (!scenario.effectiveResponses || 
        scenario.effectiveResponses.effective.length === 0) {
      console.warn('Validation failed: No effective responses available');
      return false;
    }

    return true;
  }

  /**
   * Export scenario for manual editing/review
   */
  exportScenario(scenario) {
    return {
      id: scenario.id,
      inject: scenario.inject,
      intelligence: scenario.intelligence,
      actualImpact: scenario.actualImpact,
      components: scenario.components,
      effectiveResponses: scenario.effectiveResponses,
      metadata: {
        ...scenario.metadata,
        exported: new Date().toISOString(),
        exportedBy: 'ScenarioGenerator v1.0'
      },
      editingNotes: {
        narrative: 'Edit inject text for clarity or classification level',
        intelligence: 'Adjust metrics 1-10 for scenario difficulty',
        actualImpact: 'Hidden from player - actual harm if this spreads',
        effectiveResponses: 'Responses that work well/poorly against this inject'
      }
    };
  }

  /**
   * Import manually edited scenario
   */
  importScenario(editedScenario) {
    // Validate imported scenario
    if (!this._validateImportedScenario(editedScenario)) {
      throw new Error('Invalid scenario format');
    }
    
    return {
      ...editedScenario,
      metadata: {
        ...editedScenario.metadata,
        imported: new Date().toISOString(),
        source: 'manual_edit'
      }
    };
  }

  _validateImportedScenario(scenario) {
    return (
      scenario.inject &&
      scenario.intelligence &&
      scenario.intelligence.salience >= 1 &&
      scenario.intelligence.salience <= 10 &&
      scenario.intelligence.projectedImpact >= 1 &&
      scenario.intelligence.projectedImpact <= 10 &&
      scenario.actualImpact >= 1 &&
      scenario.actualImpact <= 10
    );
  }
}