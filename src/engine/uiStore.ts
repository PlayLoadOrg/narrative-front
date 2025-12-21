// src/engine/uiStore.ts

import { create } from 'zustand';
import type { UIState, AudioState, AudioTrack } from './types';

interface ExtendedUIState extends UIState {
  audio: AudioState;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setAudioTrack: (track: AudioTrack) => void;
}

export const useUIStore = create<ExtendedUIState>((set) => ({
  isFrontopediaOpen: false,
  activeArticleId: null,
  
  // Audio state
  audio: {
    currentTrack: 'neutral',
    volume: 0.6,
    isMuted: false
  },

  openFrontopedia: (articleId?: string) => {
    set({ 
      isFrontopediaOpen: true, 
      activeArticleId: articleId || null 
    });
  },
  
  closeFrontopedia: () => {
    set({ 
      isFrontopediaOpen: false, 
      activeArticleId: null 
    });
  },

  setVolume: (volume: number) => {
    set(state => ({
      audio: {
        ...state.audio,
        volume: Math.max(0, Math.min(1, volume))
      }
    }));
  },

  toggleMute: () => {
    set(state => ({
      audio: {
        ...state.audio,
        isMuted: !state.audio.isMuted
      }
    }));
  },

  setAudioTrack: (track: AudioTrack) => {
    set(state => ({
      audio: {
        ...state.audio,
        currentTrack: track
      }
    }));
  }
}));