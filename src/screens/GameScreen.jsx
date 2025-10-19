// src/screens/GameScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Menu, AlertTriangle, CheckCircle, TrendingUp, Eye, Clock } from 'lucide-react';
import { ScenarioGenerator } from '../components/ScenarioGenerator';
import { OutcomeCalculator } from '../components/ResponseOutcomeGenerator';
import { MeterDisplay } from '../components/MeterDisplays';
import { SettingsMenu } from '../components/SettingsMenu';
import { ResponseDetailPanel } from '../components/ResponseDetailPanel';
import { DeckBuilder } from '../components/DeckBuilder';
import { OutcomeScreen } from '../screens/OutcomeScreen';
import { GAME_CONFIG } from '../constants';
import narrativeFrontLogo from '../assets/narrativeFront.svg';
import proceduralComponents from '../data/procedural.json';

export function GameScreen({
  round, meter, manpower, reputation, playerDeck, scenarioHistory,
  meterType, language, setLanguage, isMuted, setIsMuted, setMeterType,
  onMeterChange, onManpowerChange, onReputationChange, onRoundChange,
  onScenarioHistoryChange, onPlayerDeckChange, onAddCard, onStudyDoctrine, onNewRun, onGameEnd, i18n
}) {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [activeDetailPanel, setActiveDetailPanel] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeckBuilding, setIsDeckBuilding] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState(null);

  const scenarioGenerator = useRef(null);
  const outcomeCalculator = useRef(null);

  useEffect(() => {
    scenarioGenerator.current = new ScenarioGenerator(proceduralComponents);
    outcomeCalculator.current = new OutcomeCalculator(proceduralComponents);
  }, []);

  useEffect(() => {
    if (!currentScenario && scenarioGenerator.current && !isDeckBuilding && !showOutcome) {
      generateScenario(round, 1 + round * 0.8);
    }
  }, [round, isDeckBuilding, showOutcome]);

  const generateScenario = (roundNumber, difficulty) => {
    if (!scenarioGenerator.current) return;
    const gameState = { reputation, previousScenarios: scenarioHistory, round: roundNumber };
    const scenario = scenarioGenerator.current.generateScenario(roundNumber, difficulty, gameState);
    setCurrentScenario(scenario);
    setSelectedResponses([]);
    setActiveDetailPanel(null);
  };

  const handleResponseSelection = (category, option) => {
    const filtered = selectedResponses.filter(r => r.type !== category);
    setSelectedResponses([...filtered, { type: category, ...option }]);
    setActiveDetailPanel(null);
  };

  const handleCancelResponse = (category) => {
    setSelectedResponses(selectedResponses.filter(r => r.type !== category));
    setActiveDetailPanel(null);
  };

  const confirmResponses = () => {
    const outcome = outcomeCalculator.current.calculateOutcome(
      currentScenario, selectedResponses, { reputation, manpower, meter }
    );
    setCurrentOutcome(outcome);
    setShowOutcome(true);
  };

  const handleOutcomeContinue = () => {
    const outcome = currentOutcome;
    
    onMeterChange(Math.max(-5, Math.min(5, meter + outcome.meterShift)));
    const newManpower = Math.max(0, manpower - outcome.manpowerCost);
    onManpowerChange(newManpower);
    onReputationChange(Math.max(0, Math.min(100, reputation + outcome.reputationChange)));

    if (outcome.reward) {
      const type = outcome.reward.type;
      const available = proceduralComponents[type === 'prebunk' ? 'prebunks' : 'counterNarratives']
        .filter(item => !playerDeck[type === 'prebunk' ? 'prebunks' : 'counterNarratives']
        .find(p => p.id === item.id));
      if (available.length > 0) {
        onAddCard(type, available[Math.floor(Math.random() * available.length)]);
      }
    }

    onScenarioHistoryChange([...scenarioHistory, { 
      ...currentScenario, 
      responses: selectedResponses, 
      outcome 
    }]);

    setShowOutcome(false);
    setCurrentOutcome(null);
    handleNext();
  };

  const handleNext = () => {
    if (round < GAME_CONFIG.TOTAL_ROUNDS - 1) {
      setIsDeckBuilding(true);
      setCurrentScenario(null);
    } else {
      onGameEnd();
    }
  };

  const handleDeckBuilt = (newDeck) => {
    onPlayerDeckChange(newDeck);
    setIsDeckBuilding(false);
    
    const nextRound = round + 1;
    onRoundChange(nextRound);
    
    const trickle = Math.floor(reputation * GAME_CONFIG.MANPOWER_TRICKLE_RATE);
    onManpowerChange(manpower + trickle);
    
    generateScenario(nextRound, 1 + nextRound * 0.8);
  };

  if (showOutcome && currentOutcome) {
    return (
      <OutcomeScreen
        outcome={currentOutcome}
        onContinue={handleOutcomeContinue}
        i18n={i18n}
      />
    );
  }

  if (isDeckBuilding) {
    return (
      <DeckBuilder
        currentDeck={playerDeck}
        availableCards={proceduralComponents}
        manpower={manpower}
        onFinish={handleDeckBuilt}
        i18n={i18n}
      />
    );
  }

  if (!currentScenario) return <div className="card">{i18n.loading}</div>;

  const isResponseSelected = (type) => selectedResponses.some(r => r.type === type);
  const getTotalManpower = () => selectedResponses.reduce((sum, r) => sum + r.manpower, 0);

  return (
    <div className="game-wrapper">
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        language={language}
        setLanguage={setLanguage}
        meterType={meterType}
        setMeterType={setMeterType}
        onStudyDoctrine={onStudyDoctrine}
        onNewRun={onNewRun}
        i18n={i18n}
      />
      
      <ResponseDetailPanel
        category={activeDetailPanel}
        playerDeck={playerDeck}
        proceduralComponents={proceduralComponents}
        manpower={manpower}
        onSelect={handleResponseSelection}
        onClose={() => setActiveDetailPanel(null)}
        onCancel={handleCancelResponse}
        i18n={i18n}
      />
      
      <div className="game-content">
        <header className="game-header">
          <button className="settings-hamburger" onClick={() => setIsSettingsOpen(true)}>
            <Menu/>
          </button>
          <div className="header-title-container">
            <Shield className="header-icon" />
            <span className="header-title">{i18n.appTitle}</span>
          </div>
          <img src={narrativeFrontLogo} alt="Logo" className="header-logo" />
        </header>
        <div className="header-subtitle">{i18n.appSubtitle}</div>
        
        <div className="resource-display">
          <span className="resource-item">{i18n.manpowerLabel || 'Manpower'}: {manpower}</span>
          <span className="resource-item">{i18n.reputationLabel || 'Reputation'}: {reputation}/100</span>
        </div>

        <MeterDisplay value={meter} meterType={meterType} lang={i18n} />
        
        <div className={`card-fader ${isSettingsOpen || activeDetailPanel ? 'blurred' : ''}`}>
          <div className="card scenario-card-compact">
            <div className="inject-header">
              <AlertTriangle className="inject-icon-small" />
              <h3 className="inject-title-compact">
                {i18n.roundLabel} {round + 1} – {i18n.adversaryInject}
              </h3>
            </div>
            <p className="inject-text-compact">{currentScenario.inject}</p>
            
            <div className="intel-compact">
              <div className="intel-row">
                <Clock size={16} className="intel-icon" />
                <span className="intel-label">Time Active:</span>
                <span className="intel-value">{currentScenario.intelligence.hoursSinceAppearance}h</span>
              </div>
              <div className="threat-badge-compact">
                {currentScenario.intelligence.projectedImpact >= 7 ? '🔴 HIGH THREAT' :
                 currentScenario.intelligence.projectedImpact >= 4 ? '🟡 MODERATE THREAT' : '🟢 LOW THREAT'}
              </div>
              
              {['projectedImpact', 'salience', 'sourceNotoriety'].map((metric, idx) => (
                <div key={idx} className="intel-metric">
                  <div className="metric-header-compact">
                    {metric === 'projectedImpact' && <TrendingUp size={14} />}
                    {metric === 'salience' && <TrendingUp size={14} />}
                    {metric === 'sourceNotoriety' && <Eye size={14} />}
                    <span>
                      {metric === 'projectedImpact' && 'Projected Impact'}
                      {metric === 'salience' && 'Salience'}
                      {metric === 'sourceNotoriety' && 'Source Notoriety'}
                      : {currentScenario.intelligence[metric]}/10
                    </span>
                  </div>
                  <div className="metric-bar-compact">
                    <div className="metric-fill" style={{ 
                      width: `${currentScenario.intelligence[metric] * 10}%`,
                      backgroundColor: metric === 'projectedImpact' ? 
                        (currentScenario.intelligence[metric] >= 7 ? '#ef4444' : 
                         currentScenario.intelligence[metric] >= 4 ? '#facc15' : '#4ade80') :
                        metric === 'salience' ? '#facc15' : '#60a5fa'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card response-card-compact">
            <h4 className="response-title-compact">{i18n.yourResponse}</h4>
            <div className="response-grid-compact">
              {playerDeck.prebunks.length > 0 && (
                <button className={`button response-category-button ${isResponseSelected('prebunk') ? 'selected' : ''}`}
                  onClick={() => setActiveDetailPanel('prebunk')}>
                  {isResponseSelected('prebunk') && <CheckCircle size={16} className="check-icon-small" />}
                  {i18n.prebunksLabel || 'Pre-bunks'}
                </button>
              )}
              {playerDeck.counterNarratives.length > 0 && (
                <button className={`button response-category-button ${isResponseSelected('counter_narrative') ? 'selected' : ''}`}
                  onClick={() => setActiveDetailPanel('counter_narrative')}>
                  {isResponseSelected('counter_narrative') && <CheckCircle size={16} className="check-icon-small" />}
                  {i18n.counterNarrativesLabel || 'Counter-Narratives'}
                </button>
              )}
              <button className={`button response-category-button ${isResponseSelected('factcheck') ? 'selected' : ''}`}
                onClick={() => setActiveDetailPanel('factcheck')}>
                {isResponseSelected('factcheck') && <CheckCircle size={16} className="check-icon-small" />}
                {i18n.factCheckLabel || 'Fact-Check'}
              </button>
              <button className={`button response-category-button ${isResponseSelected('discredit') ? 'selected' : ''}`}
                onClick={() => setActiveDetailPanel('discredit')}>
                {isResponseSelected('discredit') && <CheckCircle size={16} className="check-icon-small" />}
                {i18n.discreditLabel || 'Discredit'}
              </button>
            </div>
            <div className="manpower-summary-compact">
              <span>Allocated: {getTotalManpower()} / {manpower}</span>
            </div>
            <button onClick={confirmResponses} className="button primary-button full-width" 
              disabled={getTotalManpower() > manpower}>
              {selectedResponses.length === 0 ? 'Ignore' : 'Confirm Response'}
            </button>
          </div>
        </div>
        <footer className="game-footer">
          {i18n.roundLabel} {round + 1} of {GAME_CONFIG.TOTAL_ROUNDS}
        </footer>
      </div>
    </div>
  );
}