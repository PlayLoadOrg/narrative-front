// src/hooks/useCards.ts
import { useState, useCallback } from 'react';
import type { AnticipationCard, PlayerDeck } from '../engine/types';
import cardsData from '../data/outcomes/anticipation_cards.json';

interface UseCardsReturn {
  deck: PlayerDeck;
  drawCards: (count: number) => AnticipationCard[];
  buildCard: (card: AnticipationCard) => void;
  hasCard: (cardId: string) => boolean;
  useCard: (cardId: string) => boolean;
  resetDeck: () => void;
}

export function useCards(): UseCardsReturn {
  const [deck, setDeck] = useState<PlayerDeck>({
    counterNarratives: [],
    preBunks: []
  });

  /**
   * Draw random cards from pool
   */
  const drawCards = useCallback((count: number): AnticipationCard[] => {
    const availableCards = [...(cardsData.pool as AnticipationCard[])];
    const drawn: AnticipationCard[] = [];

    for (let i = 0; i < count && availableCards.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      drawn.push(availableCards[randomIndex]);
      availableCards.splice(randomIndex, 1);
    }

    return drawn;
  }, []);

  /**
   * Build a card (add to player deck)
   */
  const buildCard = useCallback((card: AnticipationCard) => {
    setDeck(prev => {
      if (card.type === 'COUNTER_NARRATIVE') {
        return {
          ...prev,
          counterNarratives: [...prev.counterNarratives, card]
        };
      } else {
        return {
          ...prev,
          preBunks: [...prev.preBunks, card]
        };
      }
    });
  }, []);

  /**
   * Check if player has a specific card
   */
  const hasCard = useCallback((cardId: string): boolean => {
    return deck.counterNarratives.some(c => c.id === cardId) ||
           deck.preBunks.some(c => c.id === cardId);
  }, [deck]);

  /**
   * Use a card (remove from deck)
   */
  const useCard = useCallback((cardId: string): boolean => {
    let found = false;

    setDeck(prev => {
      const cnIndex = prev.counterNarratives.findIndex(c => c.id === cardId);
      if (cnIndex !== -1) {
        found = true;
        return {
          ...prev,
          counterNarratives: prev.counterNarratives.filter((_, i) => i !== cnIndex)
        };
      }

      const pbIndex = prev.preBunks.findIndex(c => c.id === cardId);
      if (pbIndex !== -1) {
        found = true;
        return {
          ...prev,
          preBunks: prev.preBunks.filter((_, i) => i !== pbIndex)
        };
      }

      return prev;
    });

    return found;
  }, []);

  /**
   * Reset deck to empty
   */
  const resetDeck = useCallback(() => {
    setDeck({
      counterNarratives: [],
      preBunks: []
    });
  }, []);

  return {
    deck,
    drawCards,
    buildCard,
    hasCard,
    useCard,
    resetDeck
  };
}