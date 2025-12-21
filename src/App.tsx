// src/App.tsx
import { useState, useEffect } from 'react';
import { StartScreen } from './screens/StartScreen';
import { BriefingScreen } from './screens/BriefingScreen';
import { ModeSelectionScreen } from './screens/ModeSelectionScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';
import { EditorScreen } from './screens/EditorScreen';
import { useGameState } from './hooks/useGameState';

function App() {
  const gameState = useGameState();
  const [currentHash, setCurrentHash] = useState(window.location.hash.slice(1) || 'start');

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.slice(1) || 'start');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleStartToGame = () => {
    gameState.resetGameState();
    window.location.hash = 'briefing';
  };

  const handleBriefingToModeSelection = () => {
    window.location.hash = 'mode-selection';
  };

  const handleModeSelection = () => {
    window.location.hash = 'game';
  };

  const handleGameEnd = () => {
    window.location.hash = 'end';
  };

  const handlePlayAgain = () => {
    gameState.resetGameState();
    window.location.hash = 'briefing';
  };

  const handleExitEditor = () => {
    window.location.hash = 'start';
  };

  // Render based on currentHash (not window.location.hash directly)
  switch (currentHash) {
    case 'start':
      return <StartScreen onStart={handleStartToGame} />;
    
    case 'briefing':
      return <BriefingScreen onStart={handleBriefingToModeSelection} />;
    
    case 'mode-selection':
      return <ModeSelectionScreen onSelectMode={handleModeSelection} />;
    
    case 'game':
      return (
        <GameScreen
          round={gameState.round}
          meter={gameState.meter}
          manpower={gameState.manpower}
          preBunksUsed={gameState.preBunksUsed}
          onMeterChange={gameState.updateMeter}
          onManpowerChange={(change) => {
            if (change < 0) gameState.spendManpower(Math.abs(change));
            else gameState.addManpower(change);
          }}
          onAdvanceRound={gameState.advanceRound}
          onRegisterPreBunk={gameState.registerPreBunk}
          onRecordScenario={gameState.recordScenario}
          onGameEnd={handleGameEnd}
        />
      );
    
    case 'end':
      return (
        <EndScreen
          meter={gameState.meter}
          manpower={gameState.manpower}
          scenarioHistory={gameState.scenarioHistory}
          onPlayAgain={handlePlayAgain}
        />
      );
    
    case 'editor':
      return (
        <EditorScreen
          onExit={handleExitEditor}
        />
      );
    
    default:
      return <StartScreen onStart={handleStartToGame} />;
  }
}

export default App;