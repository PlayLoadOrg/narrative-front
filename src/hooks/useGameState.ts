// src/hooks/useGameState.ts

import { useGameStore } from '../engine/store';

/**
 * Convenience hook for accessing game state
 * Provides a cleaner API for components
 */
export function useGameState() {
  return {
    // State
    screen: useGameStore((state) => state.screen),
    gameMode: useGameStore((state) => state.gameMode),
    scenarioId: useGameStore((state) => state.scenarioId),
    round: useGameStore((state) => state.round),
    meter: useGameStore((state) => state.meter),
    manpower: useGameStore((state) => state.manpower),
    scenarioHistory: useGameStore((state) => state.scenarioHistory),
    preBunksUsed: useGameStore((state) => state.preBunksUsed),
    
    // Actions
    resetGameState: useGameStore((state) => state.resetGameState),
    advanceRound: useGameStore((state) => state.advanceRound),
    updateMeter: useGameStore((state) => state.updateMeter),
    spendManpower: useGameStore((state) => state.spendManpower),
    addManpower: useGameStore((state) => state.addManpower),
    recordScenario: useGameStore((state) => state.recordScenario),
    registerPreBunk: useGameStore((state) => state.registerPreBunk),
    hasPreBunkFor: useGameStore((state) => state.hasPreBunkFor),
    
    // Save/Load
    saveGame: useGameStore((state) => state.saveGame),
    loadGame: useGameStore((state) => state.loadGame),
    hasSavedGame: useGameStore((state) => state.hasSavedGame),
    clearSavedGame: useGameStore((state) => state.clearSavedGame),
    
    // Game State Queries
    getGameOutcome: useGameStore((state) => state.getGameOutcome),
    isGameOver: useGameStore((state) => state.isGameOver),
  };
}