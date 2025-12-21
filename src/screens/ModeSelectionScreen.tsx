// src/screens/ModeSelectionScreen.tsx
import { Shield, Target, Infinity, Lock } from 'lucide-react';
import { PlayloadFooter } from '../components/ui/PlayloadFooter';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import styles from './ModeSelectionScreen.module.css';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'SCENARIO' | 'PROCEDURAL', scenarioId: string) => void;
}

export function ModeSelectionScreen({ onSelectMode }: ModeSelectionScreenProps) {
  const { t } = useTranslation();

  const modes = [
    {
      id: 'nato-eastern-europe',
      mode: 'SCENARIO' as const,
      icon: <Target size={48} />,
      title: t('modeSelection.natoEE.title'),
      subtitle: t('modeSelection.natoEE.subtitle'),
      classification: t('modeSelection.classification'),
      description: t('modeSelection.natoEE.description'),
      features: [
        t('modeSelection.natoEE.feature1'),
        t('modeSelection.natoEE.feature2'),
        t('modeSelection.natoEE.feature3'),
        t('modeSelection.natoEE.feature4')
      ],
      difficulty: t('modeSelection.natoEE.difficulty'),
      duration: t('modeSelection.natoEE.duration'),
      enabled: true
    },
    {
      id: 'procedural-infinite',
      mode: 'PROCEDURAL' as const,
      icon: <Infinity size={48} />,
      title: t('modeSelection.infinite.title'),
      subtitle: t('modeSelection.infinite.subtitle'),
      classification: t('modeSelection.classification'),
      description: t('modeSelection.infinite.description'),
      features: [
        t('modeSelection.infinite.feature1'),
        t('modeSelection.infinite.feature2'),
        t('modeSelection.infinite.feature3'),
        t('modeSelection.infinite.feature4')
      ],
      difficulty: t('modeSelection.infinite.difficulty'),
      duration: t('modeSelection.infinite.duration'),
      enabled: false
    }
  ];

  return (
    <div className="screen-container">
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <Shield className={styles.headerIcon} size={40} />
          <h1 className={styles.title}>{t('modeSelection.title')}</h1>
          <p className={styles.subtitle}>
            {t('modeSelection.subtitle')}
          </p>
        </div>

        {/* Mode Cards */}
        <div className={styles.grid}>
          {modes.map((modeOption) => (
            <div
              key={modeOption.id}
              className={`${styles.modeCard} ${!modeOption.enabled ? styles.disabled : ''}`}
            >
              {/* Classification Banner */}
              <div className={styles.classification}>
                {modeOption.classification}
              </div>

              {/* Icon & Title */}
              <div className={styles.modeHeader}>
                <div 
                  className={styles.iconContainer} 
                  style={{ color: modeOption.enabled ? '#22d3ee' : '#6b7280' }}
                >
                  {modeOption.enabled ? modeOption.icon : <Lock size={48} />}
                </div>
                <h2 className={styles.modeTitle}>{modeOption.title}</h2>
                <p className={styles.modeSubtitle}>{modeOption.subtitle}</p>
              </div>

              {/* Description */}
              <p className={styles.description}>
                {modeOption.description}
              </p>

              {/* Features */}
              <div className={styles.features}>
                {modeOption.features.map((feature, idx) => (
                  <div key={idx} className={styles.feature}>
                    <span className={styles.bullet}>•</span>
                    <span className={styles.featureText}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Meta Info */}
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <strong>{t('modeSelection.difficultyLabel')}:</strong> {modeOption.difficulty}
                </span>
                <span className={styles.metaItem}>
                  <strong>{t('modeSelection.durationLabel')}:</strong> {modeOption.duration}
                </span>
              </div>

              {/* Action Button */}
              {modeOption.enabled ? (
                <Button
                  onClick={() => onSelectMode(modeOption.mode, modeOption.id)}
                  variant="primary"
                  fullWidth
                >
                  {t('modeSelection.deployButton')}
                </Button>
              ) : (
                <div className={styles.comingSoon}>
                  <Lock size={16} />
                  <span>{t('modeSelection.comingSoon')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <PlayloadFooter />
    </div>
  );
}