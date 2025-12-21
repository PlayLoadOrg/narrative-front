// src/screens/EndScreen.tsx
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PlayloadFooter } from '../components/ui/PlayloadFooter';
import { Button } from '../components/ui/Button';
import { MeterDisplay } from '../components/game/MeterDisplay';
import { useTranslation } from '../hooks/useTranslation';
import { GAME_CONFIG } from '../engine/constants';
import styles from './EndScreen.module.css';

interface EndScreenProps {
  meter: number;
  manpower: number;
  scenarioHistory: any[];
  onPlayAgain: () => void;
}

export function EndScreen({ 
  meter,
  manpower,
  scenarioHistory,
  onPlayAgain 
}: EndScreenProps) {
  const { t } = useTranslation();

  // Determine outcome based on final meter
  const getOutcome = () => {
    if (meter >= GAME_CONFIG.VICTORY_THRESHOLD) {
      return {
        type: 'victory',
        title: t('end.victoryTitle'),
        message: t('end.victoryMessage'),
        icon: <CheckCircle className={styles.icon} />,
        colorClass: styles.green
      };
    } else if (meter <= GAME_CONFIG.DEFEAT_THRESHOLD) {
      return {
        type: 'defeat',
        title: t('end.defeatTitle'),
        message: t('end.defeatMessage'),
        icon: <XCircle className={styles.icon} />,
        colorClass: styles.red
      };
    } else {
      return {
        type: 'neutral',
        title: t('end.neutralTitle'),
        message: t('end.neutralMessage'),
        icon: <AlertTriangle className={styles.icon} />,
        colorClass: styles.yellow
      };
    }
  };

  const outcome = getOutcome();

  return (
    <div className="screen-container">
      <div className={styles.card}>
        {/* Outcome Icon */}
        <div className={`${styles.iconContainer} ${outcome.colorClass}`}>
          {outcome.icon}
        </div>

        {/* Outcome Title */}
        <h2 className={`${styles.title} ${outcome.colorClass}`}>
          {outcome.title}
        </h2>

        {/* Meter Display */}
        <MeterDisplay value={meter} />

        {/* Outcome Message */}
        <p className={styles.message}>{outcome.message}</p>

        {/* Final Statistics */}
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('end.finalMeterLabel')}:</span>
            <span className={`${styles.statValue} ${outcome.colorClass}`}>
              {meter > 0 ? '+' : ''}{meter}
            </span>
          </div>
          
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('end.finalManpowerLabel')}:</span>
            <span className={styles.statValue}>{manpower}</span>
          </div>
          
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('end.scenariosCompletedLabel')}:</span>
            <span className={styles.statValue}>{scenarioHistory.length}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button 
            onClick={onPlayAgain} 
            variant="primary"
            fullWidth
          >
            {t('end.playAgainButton')}
          </Button>
        </div>
      </div>
      
      <PlayloadFooter />
    </div>
  );
}