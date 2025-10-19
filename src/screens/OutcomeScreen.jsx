// src/screens/OutcomeScreen.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function OutcomeScreen({ outcome, onContinue, i18n }) {
  const getMeterIcon = () => {
    if (outcome.meterShift > 0) return <TrendingUp className="outcome-icon text-green" />;
    if (outcome.meterShift < 0) return <TrendingDown className="outcome-icon text-red" />;
    return <Minus className="outcome-icon text-yellow" />;
  };

  return (
    <div className="card outcome-card">
      <h2 className="outcome-title">{i18n.outcomeTitle || 'Outcome'}</h2>
      
      <div className="outcome-narratives">
        {outcome.outcomes.map((result, idx) => (
          <div key={idx} className="outcome-narrative">
            <p>{result.text}</p>
          </div>
        ))}
      </div>

      <div className="outcome-summary">
        <div className="outcome-stat">
          {getMeterIcon()}
          <div className="outcome-stat-details">
            <span className="outcome-stat-label">{i18n.meterChange || 'Meter Change'}</span>
            <span className={`outcome-stat-value ${outcome.meterShift > 0 ? 'text-green' : outcome.meterShift < 0 ? 'text-red' : 'text-yellow'}`}>
              {outcome.meterShift > 0 ? '+' : ''}{outcome.meterShift}
            </span>
          </div>
        </div>

        <div className="outcome-stat">
          <div className="outcome-stat-details">
            <span className="outcome-stat-label">{i18n.reputationChange || 'Reputation'}</span>
            <span className={`outcome-stat-value ${outcome.reputationChange > 0 ? 'text-green' : outcome.reputationChange < 0 ? 'text-red' : 'text-yellow'}`}>
              {outcome.reputationChange > 0 ? '+' : ''}{outcome.reputationChange}
            </span>
          </div>
        </div>

        <div className="outcome-stat">
          <div className="outcome-stat-details">
            <span className="outcome-stat-label">{i18n.manpowerSpent || 'Manpower Used'}</span>
            <span className="outcome-stat-value text-cyan">
              {outcome.manpowerCost}
            </span>
          </div>
        </div>
      </div>

      {outcome.reward && (
        <div className="outcome-reward">
          <p className="text-green">
            ✨ {outcome.reward.text || 'Reward earned!'}
          </p>
        </div>
      )}

      <button onClick={onContinue} className="button primary-button full-width">
        {i18n.continueButton || 'Continue'}
      </button>
    </div>
  );
}