// src/engine/uiStore.ts

import { create } from 'zustand';
import type { UIState } from './types';

/**
 * NARRATIVE FRONT V2 - UI State Store
 * Separate from game state for cleaner separation of concerns
 */

export const useUIStore = create<UIState>((set) => ({
  isFrontopediaOpen: false,
  activeArticleId: null,

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
}));