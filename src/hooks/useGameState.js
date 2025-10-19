// src/hooks/useGameState.js
import { useState } from 'react';
import { GAME_CONFIG } from '../constants';

export function useGameState() {
  const [round, setRound] = useState(0);
  const [meter, setMeter] = useState(0);
  const [manpower, setManpower] = useState(GAME_CONFIG.STARTING_MANPOWER);
  const [reputation, setReputation] = useState(GAME_CONFIG.STARTING_REPUTATION);
  const [scenarioHistory, setScenarioHistory] = useState([]);
  const [playerDeck, setPlayerDeck] = useState({
    prebunks: [],
    counterNarratives: []
  });

  const resetGameState = () => {
    setRound(0);
    setMeter(0);
    setManpower(GAME_CONFIG.STARTING_MANPOWER);
    setReputation(GAME_CONFIG.STARTING_REPUTATION);
    setScenarioHistory([]);
    setPlayerDeck({ prebunks: [], counterNarratives: [] });
  };

  const applyManpowerTrickle = () => {
    const trickle = Math.floor(reputation * GAME_CONFIG.MANPOWER_TRICKLE_RATE);
    setManpower(prev => prev + trickle);
  };

  const addCardToDeck = (type, card) => {
    if (type === 'prebunk') {
      setPlayerDeck(prev => ({ ...prev, prebunks: [...prev.prebunks, card] }));
    } else if (type === 'counter_narrative') {
      setPlayerDeck(prev => ({ ...prev, counterNarratives: [...prev.counterNarratives, card] }));
    }
  };

  return {
    // State
    round, meter, manpower, reputation, scenarioHistory, playerDeck,
    // Setters
    setRound, setMeter, setManpower, setReputation, setScenarioHistory, setPlayerDeck,
    // Actions
    resetGameState, applyManpowerTrickle, addCardToDeck
  };
}