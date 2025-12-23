// src/components/game/CardDraftPhase.tsx
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AnticipationCard } from '../../engine/types';
import styles from './CardDraftPhase.module.css';

interface CardDraftPhaseProps {
  availableCards: AnticipationCard[];
  onConfirmSelection: (selectedCard: AnticipationCard) => void;
  availableManpower: number;
}

export function CardDraftPhase({ 
  availableCards, 
  onConfirmSelection,
  availableManpower 
}: CardDraftPhaseProps) {
  const [selectedCard, setSelectedCard] = useState<AnticipationCard | null>(null);

  const canAfford = (card: AnticipationCard) => {
    return availableManpower >= card.cost;
  };

  const handleConfirm = () => {
    if (selectedCard) {
      onConfirmSelection(selectedCard);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Anticipation Phase</h3>
        <p className={styles.subtitle}>
          Commander, now we prepare for adversary. We craft narratives of our own, yes? 
          We've prepared options.
        </p>
      </div>

      <div className={styles.cardGrid}>
        {availableCards.map((card) => {
          const affordable = canAfford(card);
          const isSelected = selectedCard?.id === card.id;

          return (
            <button
              key={card.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''} ${!affordable ? styles.disabled : ''}`}
              onClick={() => affordable && setSelectedCard(card)}
              disabled={!affordable}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardType}>
                  {card.type === 'PREBUNK' ? '🛡️ PRE-BUNK' : '📢 COUNTER-NARRATIVE'}
                </div>
                {isSelected && (
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
          disabled={!selectedCard}
          variant="primary"
          fullWidth
        >
          {selectedCard ? `Confirm Selection: ${selectedCard.title}` : 'Select a Card'}
        </Button>
      </div>
    </div>
  );
}