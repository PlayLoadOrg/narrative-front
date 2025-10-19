// src/constants.js

import englishData from './data/english.json';
import francaisData from './data/francais.json';

export const LANGUAGES = {
  'en': { name: 'English', data: englishData },
  'fr': { name: 'Français', data: francaisData }
};

export const METER_TYPES = ['tugofwar', 'brain', 'map'];

export const GAME_CONFIG = {
  STARTING_MANPOWER: 100,
  STARTING_REPUTATION: 50,
  TOTAL_ROUNDS: 6,
  MANPOWER_TRICKLE_RATE: 0.1
};

export const AUDIO_CONFIG = {
  VOLUME: 0.4,
  LOOP: true
};