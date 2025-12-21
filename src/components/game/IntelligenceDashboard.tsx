// src/components/game/IntelligenceDashboard.tsx
import { Clock, TrendingUp, Eye, Activity, AlertCircle } from 'lucide-react';
import { VERACITY_LEVELS } from '../../engine/constants';
import { useTranslation } from '../../hooks/useTranslation';
import type { IntelligenceData } from '../../engine/types';
import styles from './IntelligenceDashboard.module.css';

interface IntelligenceDashboardProps {
  intelligence: IntelligenceData;
}

export function IntelligenceDashboard({ intelligence }: IntelligenceDashboardProps) {
  const { t } = useTranslation();

  const getVeracityColor = (veracity: string) => {
    switch (veracity) {
      case VERACITY_LEVELS.TRUE:
        return '#4ade80'; // green
      case VERACITY_LEVELS.MOSTLY_TRUE:
        return '#facc15'; // yellow
      case VERACITY_LEVELS.MISLEADING:
        return '#fb923c'; // orange
      case VERACITY_LEVELS.FALSE:
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getBarColor = (value: number, max: number = 10) => {
    const percentage = (value / max) * 100;
    if (percentage <= 33) return '#4ade80'; // green
    if (percentage <= 66) return '#facc15'; // yellow
    return '#ef4444'; // red
  };

  const getThreatLevel = () => {
    const avgThreat = (intelligence.damagePotential + (intelligence.botAmplification / 10)) / 2;
    const urgencyMultiplier = intelligence.hoursActive <= 2 ? 1.3 : 1.0;
    const totalThreat = avgThreat * urgencyMultiplier;

    if (totalThreat >= 7) {
      return {
        label: t('intelligence.threatLevelCritical'),
        color: '#ef4444'
      };
    } else if (totalThreat >= 4) {
      return {
        label: t('intelligence.threatLevelHigh'),
        color: '#facc15'
      };
    } else {
      return {
        label: t('intelligence.threatLevelModerate'),
        color: '#4ade80'
      };
    }
  };

  const threat = getThreatLevel();

  // Metrics ordered: Time, Veracity first (no bars), then 3 bars grouped
  const metrics = [
    {
      icon: <Clock size={14} />,
      label: t('intelligence.hoursActiveLabel'),
      value: `${intelligence.hoursActive}${t('intelligence.hoursActiveUnit')}`,
      color: intelligence.hoursActive <= 2 ? '#ef4444' : intelligence.hoursActive <= 6 ? '#facc15' : '#4ade80'
    },
    {
      icon: <Eye size={14} />,
      label: t('intelligence.veracityLabel'),
      value: t(`intelligence.veracity${intelligence.veracity.replace(/\s/g, '')}`),
      color: getVeracityColor(intelligence.veracity)
    },
    {
      icon: <TrendingUp size={14} />,
      label: t('intelligence.damagePotentialLabel'),
      value: `${intelligence.damagePotential}${t('intelligence.damagePotentialScale')}`,
      barValue: intelligence.damagePotential,
      barMax: 10,
      color: getBarColor(intelligence.damagePotential, 10)
    },
    {
      icon: <AlertCircle size={14} />,
      label: t('intelligence.emotionalResonanceLabel'),
      value: `${intelligence.emotionalResonance}${t('intelligence.emotionalResonanceScale')}`,
      barValue: intelligence.emotionalResonance,
      barMax: 10,
      color: getBarColor(intelligence.emotionalResonance, 10)
    },
    {
      icon: <Activity size={14} />,
      label: t('intelligence.botAmplificationLabel'),
      value: `${intelligence.botAmplification}${t('intelligence.botAmplificationUnit')}`,
      barValue: intelligence.botAmplification,
      barMax: 100,
      color: getBarColor(intelligence.botAmplification, 100)
    }
  ];

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{t('intelligence.title')}</h4>
      
      {/* Threat Level Badge */}
      <div 
        className={styles.threatBadge}
        style={{ 
          backgroundColor: `${threat.color}20`, 
          borderColor: threat.color,
          color: threat.color
        }}
      >
        {threat.label}
      </div>

      {/* All Metrics in Compact Layout */}
      {metrics.map((metric, idx) => (
        <div key={idx} className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon} style={{ color: metric.color }}>
              {metric.icon}
            </span>
            <span className={styles.metricLabel}>{metric.label}:</span>
            <span className={styles.metricValue} style={{ color: metric.color }}>
              {metric.value}
            </span>
          </div>
          
          {/* Optional bar for quantitative metrics */}
          {metric.barValue !== undefined && (
            <div className={styles.metricBar}>
              <div 
                className={styles.metricBarFill}
                style={{
                  width: `${(metric.barValue / (metric.barMax || 10)) * 100}%`,
                  backgroundColor: metric.color
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}