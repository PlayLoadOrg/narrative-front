// src/components/game/MeterDisplay.tsx
import { useTranslation } from '../../hooks/useTranslation';
import styles from './MeterDisplay.module.css';

interface MeterDisplayProps {
  value: number;
}

export function MeterDisplay({ value, meterType = 'tugofwar' }: MeterDisplayProps) {
  const { t } = useTranslation();
  
  // Convert -10...10 range to 0%...100% for CSS positioning
  // -10 => 0%, 0 => 50%, 10 => 100%
  const percentage = ((value + 10) / 20) * 100;
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div className={styles.fill} />
        <div 
          className={styles.marker} 
          style={{ left: `${clamped}%` }}
        >
          <div className={styles.orb} />
        </div>
      </div>
      
      <div className={styles.labels}>
        <span className={styles.fragmentation}>{t('meter.fragmentationLabel')}</span>
        <span className={styles.neutral}>{t('meter.neutralLabel')}</span>
        <span className={styles.unity}>{t('meter.unityLabel')}</span>
      </div>
      
      <div className={styles.value}>
        {t('meter.label')}: {value > 0 ? '+' : ''}{value}
      </div>
    </div>
  );
}