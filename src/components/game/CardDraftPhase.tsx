// src/components/game/CardDraftPhase.tsx
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AnticipationCard } from '../../engine/types';
import styles from './CardDraftPhase.module.css';

interface CardDraftPhaseProps {
  availableCards: AnticipationCard[];
  onConfirmSelection: (selectedCards: AnticipationCard[]) => void;
  availableManpower: number;
}

export function CardDraftPhase({ 
  availableCards, 
  onConfirmSelection,
  availableManpower 
}: CardDraftPhaseProps) {
  const [selectedCards, setSelectedCards] = useState<AnticipationCard[]>([]);

  const canAfford = (card: AnticipationCard) => {
    const currentCost = selectedCards.reduce((sum, c) => sum + c.cost, 0);
    return (currentCost + card.cost) <= availableManpower;
  };

  const isSelected = (card: AnticipationCard) => {
    return selectedCards.some(c => c.id === card.id);
  };

  const handleCardToggle = (card: AnticipationCard) => {
    if (isSelected(card)) {
      // Remove card
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    } else if (canAfford(card)) {
      // Add card
      setSelectedCards(prev => [...prev, card]);
    }
  };

  const handleConfirm = () => {
    onConfirmSelection(selectedCards);
  };

  const totalCost = selectedCards.reduce((sum, c) => sum + c.cost, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Anticipation Phase</h3>
        <p className={styles.subtitle}>
          Commander, now we prepare for adversary. We craft narratives of our own, yes? 
          We've prepared options. Select 0-3 cards to build defenses.
        </p>
        <div className={styles.costSummary}>
          <span>Selected: {selectedCards.length}/3</span>
          <span>•</span>
          <span>Cost: {totalCost} MP</span>
          <span>•</span>
          <span>Remaining: {availableManpower - totalCost} MP</span>
        </div>
      </div>

      <div className={styles.cardGrid}>
        {availableCards.map((card) => {
          const affordable = canAfford(card);
          const selected = isSelected(card);

          return (
            <button
              key={card.id}
              className={`${styles.card} ${selected ? styles.selected : ''} ${!affordable && !selected ? styles.disabled : ''}`}
              onClick={() => handleCardToggle(card)}
              disabled={!affordable && !selected}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardType}>
                  {card.type === 'PREBUNK' ? '🛡️ PRE-BUNK' : '📢 COUNTER-NARRATIVE'}
                </div>
                {selected && (
                  <CheckCircle size={20} className={styles.checkIcon} />
                )}
              </div>

              <h4 className={styles.cardTitle}>{card.title}</h4>
              
              <div className={styles.cardMeta}>
                <span className={styles.cardTheme}>
                  Theme: <strong>{card.targetTheme}</strong>
                </span>
                <span className={styles.cardFamily}>
                  {card.family.replace('_', ' ')}
                </span>
              </div>

              <p className={styles.cardDescription}>{card.description}</p>

              <div className={styles.cardFooter}>
                <span className={styles.cardCost}>{card.cost} MP</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button
          onClick={handleConfirm}
          variant="primary"
          fullWidth
        >
          {selectedCards.length === 0 
            ? 'Skip Anticipation (Save All MP)' 
            : `Confirm Selection (${selectedCards.length} card${selectedCards.length > 1 ? 's' : ''})`
          }
        </Button>
      </div>
    </div>
  );
}