// src/engine/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GAME_CONFIG, STORAGE } from './constants';
import type { GameState, Scenario, PlayerResponse, RoundOutcome, ScenarioRecord, GamePhase } from './types';

/**
 * NARRATIVE FRONT V2 - Main Game State Store
 * Uses Zustand with persist middleware for save/load
 */

const INITIAL_STATE = {
  screen: 'START' as GamePhase,
  gameMode: 'SCENARIO' as const,
  scenarioId: 'nato-eastern-europe',
  round: 0,
  meter: 0,
  manpower: GAME_CONFIG.STARTING_MANPOWER,
  scenarioHistory: [] as ScenarioRecord[],
  preBunksUsed: [] as string[],
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      /**
       * Reset game to initial state
       */
      resetGameState: () => {
        set({
          ...INITIAL_STATE,
          screen: 'BRIEFING', // Start at briefing when resetting
          round: 0,
          meter: 0,
          manpower: GAME_CONFIG.STARTING_MANPOWER,
          scenarioHistory: [],
          preBunksUsed: [],
        });
      },

      /**
       * Advance to next round
       */
      advanceRound: () => {
        const currentRound = get().round;
        const newRound = currentRound + 1;
        
        set({
          round: newRound,
          manpower: GAME_CONFIG.STARTING_MANPOWER, // Refill manpower
        });
        
        return newRound;
      },

      /**
       * Update meter with bounds checking
       */
      updateMeter: (change: number) => {
        set((state) => {
          const newValue = state.meter + change;
          return {
            meter: Math.max(
              GAME_CONFIG.METER_MIN,
              Math.min(GAME_CONFIG.METER_MAX, newValue)
            ),
          };
        });
      },

      /**
       * Spend manpower
       */
      spendManpower: (cost: number) => {
        set((state) => ({
          manpower: Math.max(0, state.manpower - cost),
        }));
      },

      /**
       * Add manpower
       */
      addManpower: (amount: number) => {
        set((state) => ({
          manpower: state.manpower + amount,
        }));
      },

      /**
       * Record a scenario outcome in history
       */
      recordScenario: (
        scenario: Scenario,
        responses: PlayerResponse[],
        outcome: RoundOutcome
      ): ScenarioRecord => {
        const { round, meter } = get();
        
        const record: ScenarioRecord = {
          round,
          scenarioId: scenario.id,
          inject: scenario.inject.primary.text,
          responses,
          outcome,
          meterBefore: meter,
          meterAfter: meter + outcome.meterShift,
          manpowerSpent: outcome.manpowerCost,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          scenarioHistory: [...state.scenarioHistory, record],
        }));
        
        return record;
      },

      /**
       * Register a pre-bunk as used (for future synergy bonuses)
       */
      registerPreBunk: (theme: string) => {
        set((state) => {
          if (state.preBunksUsed.includes(theme)) {
            return state; // Already registered
          }
          return {
            preBunksUsed: [...state.preBunksUsed, theme],
          };
        });
      },

      /**
       * Check if pre-bunk exists for a given theme
       */
      hasPreBunkFor: (theme: string): boolean => {
        return get().preBunksUsed.includes(theme);
      },

      /**
       * Save game state to localStorage
       */
      saveGame: (): boolean => {
        try {
          const state = get();
          const gameState = {
            screen: state.screen,
            gameMode: state.gameMode,
            scenarioId: state.scenarioId,
            round: state.round,
            meter: state.meter,
            manpower: state.manpower,
            scenarioHistory: state.scenarioHistory,
            preBunksUsed: state.preBunksUsed,
            savedAt: new Date().toISOString(),
          };
          
          localStorage.setItem(STORAGE.GAME_STATE, JSON.stringify(gameState));
          return true;
        } catch (error) {
          console.error('Failed to save game:', error);
          return false;
        }
      },

      /**
       * Load game state from localStorage
       */
      loadGame: (): boolean => {
        try {
          const saved = localStorage.getItem(STORAGE.GAME_STATE);
          if (!saved) return false;
          
          const gameState = JSON.parse(saved);
          
          set({
            screen: gameState.screen || 'GAME',
            gameMode: gameState.gameMode || 'SCENARIO',
            scenarioId: gameState.scenarioId || 'nato-eastern-europe',
            round: gameState.round || 0,
            meter: gameState.meter || 0,
            manpower: gameState.manpower || GAME_CONFIG.STARTING_MANPOWER,
            scenarioHistory: gameState.scenarioHistory || [],
            preBunksUsed: gameState.preBunksUsed || [],
          });
          
          return true;
        } catch (error) {
          console.error('Failed to load game:', error);
          return false;
        }
      },

      /**
       * Check if saved game exists
       */
      hasSavedGame: (): boolean => {
        return !!localStorage.getItem(STORAGE.GAME_STATE);
      },

      /**
       * Clear saved game
       */
      clearSavedGame: () => {
        localStorage.removeItem(STORAGE.GAME_STATE);
      },

      /**
       * Get game outcome based on final meter
       */
      getGameOutcome: (): 'victory' | 'defeat' | 'neutral' => {
        const meter = get().meter;
        if (meter >= GAME_CONFIG.VICTORY_THRESHOLD) return 'victory';
        if (meter <= GAME_CONFIG.DEFEAT_THRESHOLD) return 'defeat';
        return 'neutral';
      },

      /**
       * Check if game is over
       */
      isGameOver: (): boolean => {
        return get().round >= GAME_CONFIG.TOTAL_ROUNDS;
      },
    }),
    {
      name: STORAGE.GAME_STATE,
    }
  )
);