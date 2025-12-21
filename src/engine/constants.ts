// src/engine/constants.ts

/**
 * NARRATIVE FRONT V2 - Game Constants
 * All configuration values for game mechanics
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export const GAME_CONFIG = {
  TOTAL_ROUNDS: 6,
  STARTING_MANPOWER: 10,
  MANPOWER_PER_TURN: 10,
  METER_MIN: -10,
  METER_MAX: 10,
  VICTORY_THRESHOLD: 3,
  DEFEAT_THRESHOLD: -3,
} as const;

// ============================================================================
// RESPONSE COSTS
// ============================================================================

export const RESPONSE_COSTS = {
  IGNORE: 0,
  FACT_CHECK: 2,           // Basic fact-check
  PRE_BUNK: 2,
  COUNTER_NARRATIVE: 2,
  DISCREDIT_SOURCE: 2,
} as const;

export const FACT_CHECK_THOROUGH_COST = 3;  // Upgraded fact-check

// ============================================================================
// RESPONSE TYPES (Enum-like)
// ============================================================================

export const RESPONSE_TYPES = {
  IGNORE: 'IGNORE',
  FACT_CHECK: 'FACT_CHECK',
  PRE_BUNK: 'PRE_BUNK',
  COUNTER_NARRATIVE: 'COUNTER_NARRATIVE',
  DISCREDIT_SOURCE: 'DISCREDIT_SOURCE',
} as const;

export const OUTCOME_TYPES = {
  SUCCESS: 'success',
  NEUTRAL: 'neutral',
  FAILURE: 'failure',
} as const;

// ============================================================================
// VERACITY LEVELS
// ============================================================================

export const VERACITY_LEVELS = {
  TRUE: 'True',
  MOSTLY_TRUE: 'Mostly True',
  MISLEADING: 'Misleading',
  FALSE: 'False',
} as const;

// ============================================================================
// SCREENS
// ============================================================================

export const SCREENS = {
  START: 'START',
  BRIEFING: 'BRIEFING',
  MODE_SELECTION: 'MODE_SELECTION',
  GAME: 'GAME',
  END: 'END',
} as const;

// ============================================================================
// GAME MODES
// ============================================================================

export const GAME_MODES = {
  SCENARIO: 'SCENARIO',
  PROCEDURAL: 'PROCEDURAL',
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE = {
  GAME_STATE: 'narrative-front-save',
  SETTINGS: 'narrative-front-settings',
} as const;

// ============================================================================
// PROBABILITY CONFIGURATION
// ============================================================================

export const PROBABILITY_CONFIG = {
  VARIANCE: 0.05,                    // ±5% random variance
  CRITICAL_SUCCESS_CHANCE: 0.02,     // 2% chance for critical success
  CRITICAL_FAILURE_CHANCE: 0.02,     // 2% chance for critical failure
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  TYPEWRITER_SPEED: 30,              // ms per character
  TOAST_DURATION: 3000,              // ms
} as const;

// ============================================================================
// AUDIO CONFIGURATION
// ============================================================================

export const AUDIO_CONFIG = {
  VOLUME: 0.6,
  FADE_DURATION: 2000,               // ms
  LOOP: true,
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_LANGUAGE = 'en';