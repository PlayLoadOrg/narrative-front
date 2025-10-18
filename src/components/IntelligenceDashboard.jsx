// src/components/IntelligenceDashboard.jsx
import React from 'react';
import { TrendingUp, AlertCircle, Eye, Clock } from 'lucide-react';

export function IntelligenceDashboard({ intelligence, lang }) {
  const getBarColor = (value) => {
    if (value <= 3) return '#4ade80'; // green
    if (value <= 6) return '#facc15'; // yellow
    return '#ef4444'; // red
  };

  const getUrgencyColor = (hours) => {
    if (hours <= 2) return '#ef4444'; // red - very urgent
    if (hours <= 6) return '#facc15'; // yellow - urgent
    return '#4ade80'; // green - manageable
  };

  const metrics = [
    {
      icon: <TrendingUp size={20} />,
      label: lang.salienceLabel || 'Salience',
      value: intelligence.salience,
      description: lang.salienceDescription || 'How widely is this spreading?',
      max: 10
    },
    {
      icon: <AlertCircle size={20} />,
      label: lang.projectedImpactLabel || 'Projected Impact',
      value: intelligence.projectedImpact,
      description: lang.projectedImpactDescription || 'How much damage will this cause?',
      max: 10
    },
    {
      icon: <Eye size={20} />,
      label: lang.sourceNotorietyLabel || 'Source Notoriety',
      value: intelligence.sourceNotoriety,
      description: lang.sourceNotorietyDescription || 'How credible is the source?',
      max: 10
    }
  ];

  return (
    <div className="intelligence-dashboard">
      <h4 className="dashboard-title">
        {lang.intelligenceAssessment || 'Intelligence Assessment'}
      </h4>

      <div className="metrics-grid">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-header">
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-info">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}/{metric.max}</span>
              </div>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill"
                style={{
                  width: `${(metric.value / metric.max) * 100}%`,
                  backgroundColor: getBarColor(metric.value)
                }}
              />
            </div>
            <p className="metric-description">{metric.description}</p>
          </div>
        ))}

        {/* Time Since Appearance - Special Metric */}
        <div className="metric-card time-metric">
          <div className="metric-header">
            <div className="metric-icon">
              <Clock size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">{lang.timeSinceLabel || 'Time Since Appearance'}</span>
              <span 
                className="metric-value"
                style={{ color: getUrgencyColor(intelligence.hoursSinceAppearance) }}
              >
                {intelligence.hoursSinceAppearance}h
              </span>
            </div>
          </div>
          <div className="time-urgency">
            {intelligence.hoursSinceAppearance <= 2 && (
              <span className="urgency-badge critical">
                🔴 {lang.criticalUrgency || 'CRITICAL - Respond immediately'}
              </span>
            )}
            {intelligence.hoursSinceAppearance > 2 && intelligence.hoursSinceAppearance <= 6 && (
              <span className="urgency-badge high">
                🟡 {lang.highUrgency || 'HIGH - Response degrading'}
              </span>
            )}
            {intelligence.hoursSinceAppearance > 6 && (
              <span className="urgency-badge low">
                🟢 {lang.lowUrgency || 'Time pressure moderate'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Threat Assessment Summary */}
      <div className="threat-summary">
        {getThreatAssessment(intelligence, lang)}
      </div>
    </div>
  );
}

function getThreatAssessment(intel, lang) {
  const avgThreat = (intel.salience + intel.projectedImpact) / 2;
  const urgencyMultiplier = intel.hoursSinceAppearance <= 2 ? 1.3 : 1.0;
  const totalThreat = avgThreat * urgencyMultiplier;

  if (totalThreat >= 8) {
    return (
      <div className="threat-level critical">
        <strong>🔴 {lang.criticalThreat || 'CRITICAL THREAT'}</strong>
        <p>{lang.criticalThreatDesc || 'High-salience, high-impact inject requiring immediate comprehensive response.'}</p>
      </div>
    );
  } else if (totalThreat >= 5) {
    return (
      <div className="threat-level high">
        <strong>🟡 {lang.highThreat || 'HIGH THREAT'}</strong>
        <p>{lang.highThreatDesc || 'Significant threat requiring coordinated response.'}</p>
      </div>
    );
  } else {
    return (
      <div className="threat-level moderate">
        <strong>🟢 {lang.moderateThreat || 'MODERATE THREAT'}</strong>
        <p>{lang.moderateThreatDesc || 'Manageable threat - consider resource conservation.'}</p>
      </div>
    );
  }
}