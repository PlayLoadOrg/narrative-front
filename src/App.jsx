// src/App.jsx - Refactored and modular
import React, { useState } from 'react';
import { LANGUAGES } from './constants';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { StartScreen } from './screens/StartScreen';
import { BriefingScreen } from './screens/BriefingScreen';
import { DoctrineScreen } from './screens/DoctrineScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';
import './App.css';
import './styles/screens.css';
import './styles/components.css';

export default function NarrativeFront() {
  // UI State
  const [screen, setScreen] = useState('start');
  const [language, setLanguage] = useState('en');
  const [meterType, setMeterType] = useState('tugofwar');
  const [isMuted, setIsMuted] = useState(false);
  const [savedGameState, setSavedGameState] = useState(null);
  
  // Game State (from custom hook)
  const gameState = useGameState();
  
  // Audio System (from custom hook)
  const { userInteracted, setUserInteracted } = useAudio(
    gameState.meter, 
    screen, 
    isMuted
  );
  
  const i18n = LANGUAGES[language].data;

  // Navigation handlers
  const handleStartGame = () => {
    if (!userInteracted) setUserInteracted(true);
    gameState.resetGameState();
    setScreen('game');
  };

  const handleBriefingToGame = () => {
    handleStartGame();
  };

  const handleBriefingToDoctrine = () => {
    setScreen('doctrine');
  };

  const handleStudyDoctrine = () => {
    setSavedGameState({
      screen,
      round: gameState.round,
      meter: gameState.meter,
      manpower: gameState.manpower,
      reputation: gameState.reputation,
      scenarioHistory: gameState.scenarioHistory,
      playerDeck: gameState.playerDeck
    });
    setScreen('doctrine');
  };

  const handleReturnFromDoctrine = () => {
    if (savedGameState) {
      setScreen(savedGameState.screen);
      gameState.setRound(savedGameState.round);
      gameState.setMeter(savedGameState.meter);
      gameState.setManpower(savedGameState.manpower);
      gameState.setReputation(savedGameState.reputation);
      gameState.setScenarioHistory(savedGameState.scenarioHistory);
      gameState.setPlayerDeck(savedGameState.playerDeck);
      setSavedGameState(null);
    } else {
      handleStartGame();
    }
  };

  const handleNewRun = () => {
    gameState.resetGameState();
    setSavedGameState(null);
    setScreen('briefing');
  };

  const handlePlayAgain = () => {
    gameState.resetGameState();
    setScreen('briefing');
  };

  const handleRoundChange = (newRound) => {
    gameState.setRound(newRound);
  };

  const handleGameEnd = () => {
    setScreen('end');
  };

  // Render appropriate screen
  const renderScreen = () => {
    switch(screen) {
      case 'start':
        return (
          <StartScreen 
            onStart={() => {
              setUserInteracted(true);
              setScreen('briefing');
            }}
            i18n={i18n}
          />
        );

      case 'briefing':
        return (
          <BriefingScreen
            onLearn={handleBriefingToDoctrine}
            onStart={handleBriefingToGame}
            i18n={i18n}
          />
        );

      case 'doctrine':
        return (
          <DoctrineScreen
            onReturn={handleReturnFromDoctrine}
            hasGameState={!!savedGameState}
            i18n={i18n}
          />
        );

      case 'game':
        return (
          <GameScreen
            round={gameState.round}
            meter={gameState.meter}
            manpower={gameState.manpower}
            reputation={gameState.reputation}
            playerDeck={gameState.playerDeck}
            scenarioHistory={gameState.scenarioHistory}
            meterType={meterType}
            language={language}
            setLanguage={setLanguage}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            setMeterType={setMeterType}
            onMeterChange={gameState.setMeter}
            onManpowerChange={gameState.setManpower}
            onReputationChange={gameState.setReputation}
            onRoundChange={handleRoundChange}
            onScenarioHistoryChange={gameState.setScenarioHistory}
            onPlayerDeckChange={gameState.setPlayerDeck}
            onAddCard={gameState.addCardToDeck}
            onStudyDoctrine={handleStudyDoctrine}
            onNewRun={handleNewRun}
            onGameEnd={handleGameEnd}
            i18n={i18n}
          />
        );

      case 'end':
        return (
          <EndScreen
            meter={gameState.meter}
            reputation={gameState.reputation}
            manpower={gameState.manpower}
            playerDeck={gameState.playerDeck}
            meterType={meterType}
            onPlayAgain={handlePlayAgain}
            i18n={i18n}
          />
        );

      default:
        return <div className="card">Error: Unknown screen state</div>;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}