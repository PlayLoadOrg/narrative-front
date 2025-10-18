import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Menu, BookOpen, VolumeX, Volume2, RotateCcw, Globe, BarChart3, X, ArrowLeft, TrendingUp, Eye, Clock } from 'lucide-react';

// Import assets and data
import './App.css';
import ParetoLogoSVG from './assets/PSlogo.svg';
import proceduralComponents from './data/procedural.json';
import doctrineData from './data/AJP10summary.json';
import englishData from './data/english.json';
import francaisData from './data/francais.json';
import fracturingAudio from './assets/fracturing.mp3';
import neutralAudio from './assets/neutral.mp3';
import unityAudio from './assets/unity.mp3';

// Import new components
import { MeterDisplay } from './components/MeterDisplays';
import { ScenarioGenerator } from './components/ScenarioGenerator';
import { OutcomeCalculator } from './components/ResponseOutcomeGenerator';

const LANGUAGES = {
  'en': { name: 'English', data: englishData },
  'fr': { name: 'Français', data: francaisData }
};

const METER_TYPES = ['tugofwar', 'brain', 'map'];
const STARTING_MANPOWER = 100;
const STARTING_REPUTATION = 50;
const TOTAL_ROUNDS = 6;
const MANPOWER_TRICKLE_RATE = 0.1;

// Typewriter effect component
const Typewriter = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

// Helper component for text with links
const TextWithLinks = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\[link: .*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /\[link: (.*?)\]\((.*?)\)/.exec(part);
        if (match) {
          return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>;
        }
        return part;
      })}
    </>
  );
};

export default function NarrativeFront() {
  // ===== CORE GAME STATE =====
  const [screen, setScreen] = useState('start');
  const [round, setRound] = useState(0);
  const [meter, setMeter] = useState(0);
  const [manpower, setManpower] = useState(STARTING_MANPOWER);
  const [reputation, setReputation] = useState(STARTING_REPUTATION);
  
  // ===== SCENARIO STATE =====
  const [currentScenario, setCurrentScenario] = useState(null);
  const [scenarioHistory, setScenarioHistory] = useState([]);
  
  // ===== RESPONSE STATE =====
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [activeDetailPanel, setActiveDetailPanel] = useState(null);
  
  // ===== UI STATE =====
  const [language, setLanguage] = useState('en');
  const [meterType, setMeterType] = useState('tugofwar');
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedGameState, setSavedGameState] = useState(null);
  
  const i18n = LANGUAGES[language].data;

  // ===== GENERATORS =====
  const scenarioGenerator = useRef(null);
  const outcomeCalculator = useRef(null);

  // Initialize generators
  useEffect(() => {
    scenarioGenerator.current = new ScenarioGenerator(proceduralComponents);
    outcomeCalculator.current = new OutcomeCalculator(proceduralComponents);
  }, []);

  // ===== AUDIO SYSTEM =====
  const audioRefs = {
    fracturing: useRef(null),
    neutral: useRef(null),
    unity: useRef(null),
  };
  const [activeAudio, setActiveAudio] = useState('neutral');
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    audioRefs.fracturing.current = new Audio(fracturingAudio);
    audioRefs.neutral.current = new Audio(neutralAudio);
    audioRefs.unity.current = new Audio(unityAudio);
    Object.values(audioRefs).forEach(ref => {
      ref.current.loop = true;
      ref.current.volume = 0.4;
    });
  }, []);

  useEffect(() => {
    if (!userInteracted || isMuted || (screen !== 'game' && screen !== 'end')) {
      Object.values(audioRefs).forEach(ref => ref.current?.pause());
      return;
    }
  
    let targetAudio = 'neutral';
    if (meter <= -2) targetAudio = 'fracturing';
    else if (meter >= 2) targetAudio = 'unity';
  
    if (activeAudio !== targetAudio) {
      audioRefs[activeAudio].current?.pause();
      audioRefs[targetAudio].current?.play().catch(e => console.error("Audio play failed:", e));
      setActiveAudio(targetAudio);
    } else if (audioRefs[activeAudio].current?.paused) {
      audioRefs[activeAudio].current?.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [meter, screen, isMuted, userInteracted, activeAudio]);

  // ===== GAME FLOW FUNCTIONS =====

  const startGame = () => {
    if (!userInteracted) setUserInteracted(true);
    
    setRound(0);
    setMeter(0);
    setManpower(STARTING_MANPOWER);
    setReputation(STARTING_REPUTATION);
    setScenarioHistory([]);
    
    generateNextScenario(0, 1);
    
    setScreen('game');
  };

  const resetGame = (goToBriefing = true) => {
    setRound(0);
    setMeter(0);
    setManpower(STARTING_MANPOWER);
    setReputation(STARTING_REPUTATION);
    setScenarioHistory([]);
    setSelectedResponses([]);
    setActiveDetailPanel(null);
    setIsSettingsOpen(false);
    
    if (goToBriefing) {
      setScreen('briefing');
    } else {
      startGame();
    }
  };

  const generateNextScenario = (roundNumber, difficulty) => {
    if (!scenarioGenerator.current) {
      console.error('ScenarioGenerator not initialized');
      return;
    }

    const gameState = {
      reputation,
      previousScenarios: scenarioHistory,
      round: roundNumber
    };

    const scenario = scenarioGenerator.current.generateScenario(
      roundNumber,
      difficulty,
      gameState
    );

    setCurrentScenario(scenario);
    setSelectedResponses([]);
    setActiveDetailPanel(null);
  };

  const handleResponseSelection = (category, option) => {
    // Remove any existing selection from this category
    const filtered = selectedResponses.filter(r => r.type !== category);
    
    // Add the new selection
    const newSelection = {
      type: category,
      ...option
    };
    
    setSelectedResponses([...filtered, newSelection]);
    setActiveDetailPanel(null); // Close detail panel
  };

  const confirmResponses = () => {
    const gameState = { reputation, manpower, meter };
    const outcome = outcomeCalculator.current.calculateOutcome(
      currentScenario,
      selectedResponses,
      gameState
    );

    applyOutcome(outcome);
  };

  const applyOutcome = (outcome) => {
    const newMeter = Math.max(-5, Math.min(5, meter + outcome.meterShift));
    const newManpower = manpower - outcome.manpowerCost;
    const newReputation = Math.max(0, Math.min(100, reputation + outcome.reputationChange));

    setMeter(newMeter);
    setManpower(newManpower);
    setReputation(newReputation);

    setScenarioHistory([...scenarioHistory, {
      ...currentScenario,
      responses: selectedResponses,
      outcome
    }]);

    // Show outcome in alert for now
    alert(outcome.outcomes.map(o => o.text).join('\n\n') + 
          `\n\nMeter: ${outcome.meterShift > 0 ? '+' : ''}${outcome.meterShift}` +
          `\nReputation: ${outcome.reputationChange > 0 ? '+' : ''}${outcome.reputationChange}` +
          `\nManpower Used: ${outcome.manpowerCost}`);

    handleNext();
  };

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      const nextRound = round + 1;
      setRound(nextRound);
      
      // Apply manpower trickle
      const trickle = Math.floor(reputation * MANPOWER_TRICKLE_RATE);
      setManpower(prev => prev + trickle);
      
      const difficulty = Math.min(10, 1 + nextRound * 0.8);
      generateNextScenario(nextRound, difficulty);
    } else {
      setScreen('end');
    }
  };

  const studyDoctrine = () => {
    setSavedGameState({ 
      screen, 
      round, 
      meter, 
      manpower, 
      reputation, 
      currentScenario,
      scenarioHistory,
      selectedResponses
    });
    setIsSettingsOpen(false);
    setScreen('doctrine');
  };

  const returnToGame = () => {
    if (savedGameState) {
      setScreen(savedGameState.screen);
      setRound(savedGameState.round);
      setMeter(savedGameState.meter);
      setManpower(savedGameState.manpower);
      setReputation(savedGameState.reputation);
      setCurrentScenario(savedGameState.currentScenario);
      setScenarioHistory(savedGameState.scenarioHistory);
      setSelectedResponses(savedGameState.selectedResponses || []);
      setSavedGameState(null);
    } else {
      resetGame(false);
    }
  };

  // ===== SETTINGS MENU =====
  const SettingsMenu = () => (
    <>
      <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)} />
      <div className="settings-menu slide-in">
        <button className="settings-close" onClick={() => setIsSettingsOpen(false)}>
          <X size={24} />
        </button>
        <h3 className="settings-title">{i18n.settingsTitle}</h3>
        
        <button className="button settings-button" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX/> : <Volume2/>} {isMuted ? i18n.settingsSoundOff : i18n.settingsSoundOn}
        </button>
        
        <div className="settings-section">
          <div className="settings-section-label">
            <Globe size={16} /> {i18n.settingsLanguage}
          </div>
          <div className="settings-button-group">
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                className={`button settings-button-small ${language === code ? 'active' : ''}`}
                onClick={() => setLanguage(code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-section-label">
            <BarChart3 size={16} /> {i18n.settingsMeterStyle}
          </div>
          <div className="settings-button-group">
            {METER_TYPES.map((type) => (
              <button
                key={type}
                className={`button settings-button-small ${meterType === type ? 'active' : ''}`}
                onClick={() => setMeterType(type)}
              >
                {i18n[`meterDisplay${type.charAt(0).toUpperCase() + type.slice(1)}`] || type}
              </button>
            ))}
          </div>
        </div>
        
        <button className="button settings-button" onClick={studyDoctrine}>
          <BookOpen/> {i18n.settingsStudy}
        </button>
        <button className="button settings-button" onClick={() => resetGame(true)}>
          <RotateCcw/> {i18n.settingsNewRun}
        </button>
      </div>
    </>
  );

  // ===== RESPONSE DETAIL PANEL =====
  const ResponseDetailPanel = ({ category }) => {
    let options = [];
    let title = '';

    switch(category) {
      case 'factcheck':
        title = i18n.factCheckLabel || 'Fact-Check';
        options = proceduralComponents.factCheckRigors.map(r => ({
          id: r.id,
          title: r.title,
          manpower: r.manpowerCost,
          time: r.timeCost,
          rigor: r.id
        }));
        break;
      case 'discredit':
        title = i18n.discreditLabel || 'Discredit Source';
        options = proceduralComponents.discreditRigors.map(r => ({
          id: r.id,
          title: r.title,
          manpower: r.manpowerCost,
          risk: r.risks?.backfireChance,
          rigor: r.id
        }));
        break;
    }

    return (
      <>
        <div className="detail-overlay" onClick={() => setActiveDetailPanel(null)} />
        <div className="detail-panel slide-in-right">
          <div className="detail-header">
            <button className="detail-back" onClick={() => setActiveDetailPanel(null)}>
              <ArrowLeft size={20} /> Back
            </button>
            <h4>{title}</h4>
          </div>
          <div className="detail-options">
            {options.map(option => {
              const canAfford = manpower >= option.manpower;
              return (
                <button
                  key={option.id}
                  className={`button response-option ${!canAfford ? 'disabled' : ''}`}
                  onClick={() => canAfford && handleResponseSelection(category, option)}
                  disabled={!canAfford}
                >
                  <div className="option-title">{option.title}</div>
                  <div className="option-details">
                    <span className="option-cost">{option.manpower} MP</span>
                    {option.time && <span className="option-time">⏱️ {option.time}h</span>}
                    {option.risk && <span className="option-risk">⚠️ {Math.round(option.risk * 100)}%</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ===== SCREEN RENDERING =====
  const renderScreen = () => {
    switch(screen) {
      case 'start':
        return (
          <div className="card start-card">
            <img src={ParetoLogoSVG} alt="Logo" className="logo" />
            <div className="brand-text">{i18n.presenter}</div>
            <div className="credit-text">{i18n.credits}</div>
            <div className="title-container"><h1 className="main-title">{i18n.appTitle}</h1></div>
            <div className="disclaimer-text">{i18n.disclaimer}</div>
            <button onClick={() => {setUserInteracted(true); setScreen('briefing');}} className="button primary-button">
              {i18n.swearButton}
            </button>
          </div>
        );

      case 'briefing':
        return (
          <div className="card briefing-card">
            <header className="card-header">
              <span/>
              <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
            </header>
            <div className="briefing-quote">
              <Typewriter text='"In war, truth is the first casualty."' speed={50} />
              <div className="briefing-attribution">— Aeschylus</div>
            </div>
            <p className="briefing-text">
              Welcome to Narrative Front, a training simulation based on real NATO StratCom doctrine. 
              In the information battlefield, lies spread faster than truth—but you're not defenseless. 
              Learn to recognize, counter, and neutralize disinformation before it fractures alliances 
              and destroys trust. Your decisions matter. Are you ready?
            </p>
            <div className="choice-button-container">
              <button onClick={() => setScreen('doctrine')} className="button choice-button">
                {i18n.learnButton}
              </button>
              <button onClick={() => resetGame(false)} className="button choice-button primary-button">
                {i18n.trialsButton}
              </button>
            </div>
          </div>
        );

      case 'doctrine':
        return (
          <div className="card doctrine-card">
            <header className="card-header">
              <span/>
              <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
            </header>
            <div className="doctrine-content">
              {doctrineData.map((item, index) => {
                switch (item.type) {
                  case 'title': return <h1 key={index} className="doctrine-title">{item.text}</h1>;
                  case 'subtitle': return <h2 key={index} className="doctrine-subtitle">{item.text}</h2>;
                  case 'heading': return <h3 key={index} className="doctrine-heading">{item.text}</h3>;
                  case 'paragraph': return <p key={index} className="doctrine-paragraph">{item.text}</p>;
                  case 'list': return <ul key={index} className="doctrine-list">{item.items.map((li, i) => <li key={i}>{li}</li>)}</ul>;
                  case 'definitions': return <dl key={index} className="doctrine-definitions">{item.items.map((def, i) => <div key={i}><dt>{def.term}</dt><dd>{def.def}</dd></div>)}</dl>;
                  case 'final_paragraph': return <p key={index} className="doctrine-final-paragraph">{item.text}</p>;
                  default: return null;
                }
              })}
            </div>
            <div className="doctrine-footer">
              <button onClick={savedGameState ? returnToGame : () => resetGame(false)} className="button primary-button">
                {savedGameState ? i18n.doctrineReturn : i18n.doctrineProceed}
              </button>
            </div>
          </div>
        );

      case 'end':
        let outcome, message, icon, colorClass;
        if (meter >= 3) { 
          [outcome, message, icon, colorClass] = [
            i18n.endVictoryTitle, 
            i18n.endVictoryMessage, 
            <CheckCircle className="end-icon" />, 
            "text-green"
          ]; 
        } else if (meter <= -3) { 
          [outcome, message, icon, colorClass] = [
            i18n.endDefeatTitle, 
            i18n.endDefeatMessage, 
            <XCircle className="end-icon" />, 
            "text-red"
          ]; 
        } else { 
          [outcome, message, icon, colorClass] = [
            i18n.endNeutralTitle, 
            i18n.endNeutralMessage, 
            <AlertTriangle className="end-icon" />, 
            "text-yellow"
          ]; 
        }
        
        return (
          <div className="card end-card">
            <div className={`end-icon-container ${colorClass}`}>{icon}</div>
            <h2 className={`end-title ${colorClass}`}>{outcome}</h2>
            <MeterDisplay value={meter} meterType={meterType} lang={i18n} />
            <p className="end-message">{message}</p>
            <div className="end-stats">
              <p>{i18n.finalReputation || 'Final Reputation'}: {reputation}/100</p>
              <p>{i18n.finalManpower || 'Manpower Remaining'}: {manpower}</p>
            </div>
            <div className="end-actions">
              <button onClick={() => resetGame(true)} className="button primary-button">
                {i18n.playAgainButton}
              </button>
            </div>
          </div>
        );

      case 'game':
        if (!currentScenario) {
          return <div className="card">{i18n.loading}</div>;
        }

        const isResponseSelected = (type) => selectedResponses.some(r => r.type === type);
        const getTotalManpower = () => selectedResponses.reduce((sum, r) => sum + r.manpower, 0);

        return (
          <div className="game-wrapper">
            {isSettingsOpen && <SettingsMenu />}
            {activeDetailPanel && <ResponseDetailPanel category={activeDetailPanel} />}
            
            <div className="game-content">
              <header className="game-header">
                <button className="settings-hamburger" onClick={() => setIsSettingsOpen(true)}>
                  <Menu/>
                </button>
                <div className="header-title-container">
                  <Shield className="header-icon" />
                  <span className="header-title">{i18n.appTitle}</span>
                </div>
                <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
              </header>
              <div className="header-subtitle">{i18n.appSubtitle}</div>
              
              <div className="resource-display">
                <span className="resource-item">
                  {i18n.manpowerLabel || 'Manpower'}: {manpower}
                </span>
                <span className="resource-item">
                  {i18n.reputationLabel || 'Reputation'}: {reputation}/100
                </span>
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
                       currentScenario.intelligence.projectedImpact >= 4 ? '🟡 MODERATE THREAT' :
                       '🟢 LOW THREAT'}
                    </div>
                    
                    <div className="intel-metric">
                      <div className="metric-header-compact">
                        <TrendingUp size={14} />
                        <span>Projected Impact: {currentScenario.intelligence.projectedImpact}/10</span>
                      </div>
                      <div className="metric-bar-compact">
                        <div 
                          className="metric-fill" 
                          style={{ 
                            width: `${currentScenario.intelligence.projectedImpact * 10}%`,
                            backgroundColor: currentScenario.intelligence.projectedImpact >= 7 ? '#ef4444' : 
                                           currentScenario.intelligence.projectedImpact >= 4 ? '#facc15' : '#4ade80'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="intel-metric">
                      <div className="metric-header-compact">
                        <TrendingUp size={14} />
                        <span>Salience: {currentScenario.intelligence.salience}/10</span>
                      </div>
                      <div className="metric-bar-compact">
                        <div 
                          className="metric-fill" 
                          style={{ 
                            width: `${currentScenario.intelligence.salience * 10}%`,
                            backgroundColor: '#facc15'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="intel-metric">
                      <div className="metric-header-compact">
                        <Eye size={14} />
                        <span>Source Notoriety: {currentScenario.intelligence.sourceNotoriety}/10</span>
                      </div>
                      <div className="metric-bar-compact">
                        <div 
                          className="metric-fill" 
                          style={{ 
                            width: `${currentScenario.intelligence.sourceNotoriety * 10}%`,
                            backgroundColor: '#60a5fa'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card response-card-compact">
                  <h4 className="response-title-compact">{i18n.yourResponse}</h4>
                  
                  <div className="response-grid-compact">
                    <button 
                      className={`button response-category-button ${isResponseSelected('factcheck') ? 'selected' : ''}`}
                      onClick={() => setActiveDetailPanel('factcheck')}
                    >
                      {isResponseSelected('factcheck') && <CheckCircle size={16} className="check-icon-small" />}
                      {i18n.factCheckLabel || 'Fact-Check'}
                    </button>
                    
                    <button 
                      className={`button response-category-button ${isResponseSelected('discredit') ? 'selected' : ''}`}
                      onClick={() => setActiveDetailPanel('discredit')}
                    >
                      {isResponseSelected('discredit') && <CheckCircle size={16} className="check-icon-small" />}
                      {i18n.discreditLabel || 'Discredit Source'}
                    </button>
                  </div>
                  
                  <div className="manpower-summary-compact">
                    <span>Allocated: {getTotalManpower()} / {manpower}</span>
                  </div>
                  
                  <button 
                    onClick={confirmResponses} 
                    className="button primary-button full-width"
                    disabled={getTotalManpower() > manpower}
                  >
                    {selectedResponses.length === 0 ? 'Ignore' : 'Confirm Response'}
                  </button>
                </div>
              </div>
              
              <footer className="game-footer">
                {i18n.roundLabel} {round + 1} of {TOTAL_ROUNDS}
              </footer>
            </div>
          </div>
        );

      default:
        return <div>Error: Unknown screen state.</div>;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}