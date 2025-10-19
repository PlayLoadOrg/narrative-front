// src/screens/EndScreen.jsx
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { MeterDisplay } from '../components/MeterDisplays';

export function EndScreen({ meter, reputation, manpower, playerDeck, meterType, onPlayAgain, i18n }) {
  let outcome, message, icon, colorClass;
  
  if (meter >= 3) { 
    outcome = i18n.endVictoryTitle;
    message = i18n.endVictoryMessage;
    icon = <CheckCircle className="end-icon" />;
    colorClass = "text-green";
  } else if (meter <= -3) { 
    outcome = i18n.endDefeatTitle;
    message = i18n.endDefeatMessage;
    icon = <XCircle className="end-icon" />;
    colorClass = "text-red";
  } else { 
    outcome = i18n.endNeutralTitle;
    message = i18n.endNeutralMessage;
    icon = <AlertTriangle className="end-icon" />;
    colorClass = "text-yellow";
  }
  
  return (
    <div className="card end-card">
      <div className={`end-icon-container ${colorClass}`}>{icon}</div>
      <h2 className={`end-title ${colorClass}`}>{outcome}</h2>
      <MeterDisplay value={meter} meterType={meterType} lang={i18n} />
      <p className="end-message">{message}</p>
      <div className="end-stats">
        <p>{i18n.finalReputation || 'Final Reputation'}: {reputation}/100</p>
        <p>{i18n.finalManpower || 'Manpower Remaining'}: {manpower}</p>
        <p>Cards Earned: {playerDeck.prebunks.length + playerDeck.counterNarratives.length}</p>
      </div>
      <div className="end-actions">
        <button onClick={onPlayAgain} className="button primary-button">
          {i18n.playAgainButton}
        </button>
      </div>
    </div>
  );
}