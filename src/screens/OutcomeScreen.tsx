// src/screens/OutcomeScreen.tsx
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import type { RoundOutcome, Scenario } from '../engine/types';
import styles from './OutcomeScreen.module.css';


interface OutcomeScreenProps {
  outcome: RoundOutcome;
  scenario: Scenario;
  onContinue: () => void;
}

export function OutcomeScreen({ outcome, onContinue }: OutcomeScreenProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t('outcome.title')}</h2>

        {/* Outcome Narratives */}
        <div className={styles.narratives}>
          <h3 className={styles.sectionTitle}>{t('outcome.analysis')}</h3>
          {outcome.outcomes.map((narrative, idx) => (
            <div key={idx} className={styles.narrative}>
              <AlertCircle size={16} className={styles.narrativeIcon} />
              <p className={styles.narrativeText}>{narrative.text}</p>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className={styles.summary}>
          <div className={styles.stat}>
            <TrendingUp className={styles.statIcon} />
            <div className={styles.statDetails}>
              <span className={styles.statLabel}>{t('outcome.meterImpact')}</span>
              <span className={`${styles.statValue} ${outcome.meterShift > 0 ? styles.positive : outcome.meterShift < 0 ? styles.negative : ''}`}>
                {outcome.meterShift > 0 ? '+' : ''}{outcome.meterShift}
              </span>
            </div>
          </div>

          <div className={styles.stat}>
            <Users className={styles.statIcon} />
            <div className={styles.statDetails}>
              <span className={styles.statLabel}>{t('outcome.manpowerSpent')}</span>
              <span className={styles.statValue}>{outcome.manpowerCost} MP</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          variant="primary"
          fullWidth
        >
          {t('outcome.continueButton')}
        </Button>
      </div>
    </div>
  );
}