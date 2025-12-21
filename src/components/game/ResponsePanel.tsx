// src/components/game/ResponsePanel.tsx
import { CheckCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { RESPONSE_TYPES, RESPONSE_COSTS, FACT_CHECK_THOROUGH_COST } from '../../engine/constants';
import type { PlayerResponse } from '../../engine/types';
import styles from './ResponsePanel.module.css';

interface ResponsePanelProps {
  selectedResponses: PlayerResponse[];
  availableManpower: number;
  onSelectResponse: (response: PlayerResponse) => void;
  onRemoveResponse: (responseType: string) => void;
}

export function ResponsePanel({ 
  selectedResponses, 
  availableManpower,
  onSelectResponse,
  onRemoveResponse
}: ResponsePanelProps) {
  const { t } = useTranslation();

  const getSelectedResponse = (type: string) => {
    return selectedResponses.find(r => r.type === type);
  };

  const canAfford = (cost: number) => {
    const currentlyAllocated = selectedResponses.reduce((sum, r) => sum + r.manpowerCost, 0);
    return (currentlyAllocated + cost) <= availableManpower;
  };

  const responses = [
    {
      type: RESPONSE_TYPES.IGNORE,
      title: t('responses.ignore.title'),
      description: t('responses.ignore.description'),
      cost: RESPONSE_COSTS.IGNORE,
      riskWarning: t('responses.ignore.riskWarning')
    },
    {
      type: RESPONSE_TYPES.FACT_CHECK,
      title: t('responses.factCheckBasic.title'),
      description: t('responses.factCheckBasic.description'),
      cost: RESPONSE_COSTS.FACT_CHECK,
      riskWarning: null,
      hasUpgrade: true
    },
    {
      type: RESPONSE_TYPES.PRE_BUNK,
      title: t('responses.preBunk.title'),
      description: t('responses.preBunk.description'),
      cost: RESPONSE_COSTS.PRE_BUNK,
      riskWarning: t('responses.preBunk.riskWarning')
    },
    {
      type: RESPONSE_TYPES.COUNTER_NARRATIVE,
      title: t('responses.counterNarrative.title'),
      description: t('responses.counterNarrative.description'),
      cost: RESPONSE_COSTS.COUNTER_NARRATIVE,
      riskWarning: null
    },
    {
      type: RESPONSE_TYPES.DISCREDIT_SOURCE,
      title: t('responses.discreditSource.title'),
      description: t('responses.discreditSource.description'),
      cost: RESPONSE_COSTS.DISCREDIT_SOURCE,
      riskWarning: t('responses.discreditSource.riskWarning')
    }
  ];

  const handleSelect = (response: typeof responses[0]) => {
    const selected = getSelectedResponse(response.type);
    
    if (selected) {
      // Already selected, remove it
      onRemoveResponse(response.type);
    } else {
      // Select with basic cost
      if (canAfford(response.cost)) {
        onSelectResponse({
          type: response.type,
          manpowerCost: response.cost
        });
      }
    }
  };

  const handleUpgrade = (response: typeof responses[0]) => {
    if (canAfford(FACT_CHECK_THOROUGH_COST)) {
      // Remove basic if exists
      onRemoveResponse(response.type);
      // Add thorough version
      onSelectResponse({
        type: response.type,
        manpowerCost: FACT_CHECK_THOROUGH_COST
      });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        {responses.map((response) => {
          const selected = getSelectedResponse(response.type);
          const isSelected = !!selected;
          const isThorough = selected?.manpowerCost === FACT_CHECK_THOROUGH_COST;
          const affordable = canAfford(response.cost);

          return (
            <div key={response.type} className={styles.wrapper}>
              <button
                className={`${styles.option} ${isSelected ? styles.selected : ''} ${!affordable && !isSelected ? styles.disabled : ''}`}
                onClick={() => handleSelect(response)}
                disabled={!affordable && !isSelected}
              >
                <div className={styles.header}>
                  <div className={styles.title}>{response.title}</div>
                  {isSelected && (
                    <CheckCircle size={18} className={styles.checkIcon} />
                  )}
                </div>
                
                <div className={styles.description}>{response.description}</div>
                
                <div className={styles.footer}>
                  <span className={styles.cost}>
                    {response.cost} MP
                  </span>
                  
                  {response.riskWarning && (
                    <span className={styles.risk}>⚠️</span>
                  )}
                </div>

                {response.riskWarning && (
                  <div className={styles.warning}>
                    {response.riskWarning}
                  </div>
                )}
              </button>

              {/* Thorough Fact-Check Upgrade Option */}
              {response.hasUpgrade && isSelected && !isThorough && (
                <button
                  className={`${styles.upgrade} ${canAfford(FACT_CHECK_THOROUGH_COST) ? '' : styles.upgradeDisabled}`}
                  onClick={() => handleUpgrade(response)}
                  disabled={!canAfford(FACT_CHECK_THOROUGH_COST)}
                >
                  <span>⬆️ {t('responses.factCheckThorough.title')}</span>
                  <span className={styles.upgradeCost}>{FACT_CHECK_THOROUGH_COST} MP</span>
                </button>
              )}
              
              {response.hasUpgrade && isSelected && isThorough && (
                <div className={styles.thoroughBadge}>
                  ✓ {t('responses.factCheckThorough.title')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}