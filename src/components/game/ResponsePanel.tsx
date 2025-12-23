// src/components/game/ResponsePanel.tsx
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { RESPONSE_TYPES } from '../../engine/constants';
import type { PlayerResponse, AnticipationCard } from '../../engine/types';
import styles from './ResponsePanel.module.css';

interface ResponsePanelProps {
  selectedResponses: PlayerResponse[];
  availableManpower: number;
  onSelectResponse: (response: PlayerResponse) => void;
  onRemoveResponse: (responseType: string) => void;
  builtCards: AnticipationCard[];
}

export function ResponsePanel({ 
  selectedResponses, 
  availableManpower,
  onSelectResponse,
  onRemoveResponse,
  builtCards
}: ResponsePanelProps) {
  const { t } = useTranslation();
  const [factCheckIntensity, setFactCheckIntensity] = useState(2); // 2-4 MP
  const [discreditIntensity, setDiscreditIntensity] = useState(2); // 2-4 MP

  const getSelectedResponse = (type: string) => {
    return selectedResponses.find(r => r.type === type);
  };

  const canAfford = (cost: number) => {
    const currentlyAllocated = selectedResponses.reduce((sum, r) => sum + r.manpowerCost, 0);
    return (currentlyAllocated + cost) <= availableManpower;
  };

  const handleFactCheckToggle = () => {
    const selected = getSelectedResponse(RESPONSE_TYPES.FACT_CHECK);
    if (selected) {
      onRemoveResponse(RESPONSE_TYPES.FACT_CHECK);
    } else if (canAfford(factCheckIntensity)) {
      onSelectResponse({
        type: RESPONSE_TYPES.FACT_CHECK,
        manpowerCost: factCheckIntensity
      });
    }
  };

  const handleDiscreditToggle = () => {
    const selected = getSelectedResponse(RESPONSE_TYPES.DISCREDIT_SOURCE);
    if (selected) {
      onRemoveResponse(RESPONSE_TYPES.DISCREDIT_SOURCE);
    } else if (canAfford(discreditIntensity)) {
      onSelectResponse({
        type: RESPONSE_TYPES.DISCREDIT_SOURCE,
        manpowerCost: discreditIntensity
      });
    }
  };

  const handleCounterNarrativeToggle = () => {
    const selected = getSelectedResponse(RESPONSE_TYPES.COUNTER_NARRATIVE);
    if (selected) {
      onRemoveResponse(RESPONSE_TYPES.COUNTER_NARRATIVE);
    } else if (canAfford(1)) {
      onSelectResponse({
        type: RESPONSE_TYPES.COUNTER_NARRATIVE,
        manpowerCost: 1
      });
    }
  };

  const hasBuiltCards = builtCards.filter(c => c.type === 'COUNTER_NARRATIVE').length > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        {/* Fact-Check with Slider */}
        <div className={styles.sliderOption}>
          <div className={styles.optionHeader}>
            <label className={styles.optionTitle}>
              <input
                type="checkbox"
                checked={!!getSelectedResponse(RESPONSE_TYPES.FACT_CHECK)}
                onChange={handleFactCheckToggle}
                className={styles.checkbox}
              />
              {t('responses.factCheckBasic.title')}
            </label>
            <span className={styles.cost}>{factCheckIntensity} MP</span>
          </div>
          <p className={styles.description}>{t('responses.factCheckBasic.description')}</p>
          <div className={styles.sliderContainer}>
            <label className={styles.sliderLabel}>Intensity:</label>
            <input
              type="range"
              min="2"
              max="4"
              value={factCheckIntensity}
              onChange={(e) => setFactCheckIntensity(parseInt(e.target.value))}
              className={styles.slider}
              disabled={!getSelectedResponse(RESPONSE_TYPES.FACT_CHECK)}
            />
            <span className={styles.sliderValue}>{factCheckIntensity === 2 ? 'Basic' : factCheckIntensity === 3 ? 'Standard' : 'Thorough'}</span>
          </div>
        </div>

        {/* Discredit Source with Slider */}
        <div className={styles.sliderOption}>
          <div className={styles.optionHeader}>
            <label className={styles.optionTitle}>
              <input
                type="checkbox"
                checked={!!getSelectedResponse(RESPONSE_TYPES.DISCREDIT_SOURCE)}
                onChange={handleDiscreditToggle}
                className={styles.checkbox}
              />
              {t('responses.discreditSource.title')}
            </label>
            <span className={styles.cost}>{discreditIntensity} MP</span>
          </div>
          <p className={styles.description}>{t('responses.discreditSource.description')}</p>
          <div className={styles.sliderContainer}>
            <label className={styles.sliderLabel}>Intensity:</label>
            <input
              type="range"
              min="2"
              max="4"
              value={discreditIntensity}
              onChange={(e) => setDiscreditIntensity(parseInt(e.target.value))}
              className={styles.slider}
              disabled={!getSelectedResponse(RESPONSE_TYPES.DISCREDIT_SOURCE)}
            />
            <span className={styles.sliderValue}>{discreditIntensity === 2 ? 'Light' : discreditIntensity === 3 ? 'Moderate' : 'Aggressive'}</span>
          </div>
          {getSelectedResponse(RESPONSE_TYPES.DISCREDIT_SOURCE) && (
            <div className={styles.warning}>
              {t('responses.discreditSource.riskWarning')}
            </div>
          )}
        </div>

        {/* Counter-Narrative (uses built card) */}
        <div className={`${styles.sliderOption} ${!hasBuiltCards ? styles.disabled : ''}`}>
          <div className={styles.optionHeader}>
            <label className={styles.optionTitle}>
              <input
                type="checkbox"
                checked={!!getSelectedResponse(RESPONSE_TYPES.COUNTER_NARRATIVE)}
                onChange={() => hasBuiltCards && handleCounterNarrativeToggle()}
                className={styles.checkbox}
                disabled={!hasBuiltCards}
              />
              {t('responses.counterNarrative.title')}
            </label>
            <span className={styles.cost}>1 MP</span>
          </div>
          <p className={styles.description}>
            {hasBuiltCards 
              ? t('responses.counterNarrative.description')
              : 'No counter-narratives built yet. Build one during Anticipation Phase.'}
          </p>
        </div>
      </div>
    </div>
  );
}