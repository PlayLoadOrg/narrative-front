// src/components/ResponseSelector.jsx
import React from 'react';
import { Check } from 'lucide-react';

export function ResponseSelector({ 
  playerDeck, 
  availableRigors, 
  selectedResponses, 
  onResponseToggle, 
  manpower,
  lang 
}) {
const isSelected = (type, id) => {
    return selectedResponses.some(r => r.type === type && (r.card?.id === id || r.rigor === id));
  };

  const getTotalManpowerCost = () => {
    return selectedResponses.reduce((sum, r) => sum + r.manpower, 0);
  };

  const canAfford = (cost) => {
    const currentCost = getTotalManpowerCost();
    return (currentCost + cost) <= manpower;
  };

  return (
    <div className="scenario-responses">
      <h4 className="responses-title">{lang.yourResponse}</h4>

      {/* Pre-bunks from Deck */}
      {playerDeck.prebunks.length > 0 && (
        <div className="response-category">
          <h5 className="category-title">{lang.prebunksLabel || 'Pre-bunks'}</h5>
          <div className="responses-grid">
            {playerDeck.prebunks.map(card => {
              const selected = isSelected('prebunk', card.id);
              const affordable = canAfford(card.manpowerCost);
              
              return (
                <button
                  key={card.id}
                  onClick={() => onResponseToggle({
                    type: 'prebunk',
                    card: card.id,
                    manpower: card.manpowerCost
                  })}
                  className={`button response-button ${selected ? 'selected' : ''}`}
                  disabled={!affordable && !selected}
                >
                  {selected && <Check className="check-icon" />}
                  <div className="response-content">
                    <span className="response-title">{card.title}</span>
                    <span className="response-cost">{card.manpowerCost} {lang.manpowerLabel || 'MP'}</span>
                    {card.risks?.canBackfire && (
                      <span className="risk-badge">⚠️</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Counter-Narratives from Deck */}
      {playerDeck.counterNarratives.length > 0 && (
        <div className="response-category">
          <h5 className="category-title">{lang.counterNarrativesLabel || 'Counter-Narratives'}</h5>
          <div className="responses-grid">
            {playerDeck.counterNarratives.map(card => {
              const selected = isSelected('counter_narrative', card.id);
              const affordable = canAfford(card.manpowerCost);
              
              return (
                <button
                  key={card.id}
                  onClick={() => onResponseToggle({
                    type: 'counter_narrative',
                    card: card.id,
                    manpower: card.manpowerCost
                  })}
                  className={`button response-button ${selected ? 'selected' : ''}`}
                  disabled={!affordable && !selected}
                >
                  {selected && <Check className="check-icon" />}
                  <div className="response-content">
                    <span className="response-title">{card.title}</span>
                    <span className="response-cost">{card.manpowerCost} {lang.manpowerLabel || 'MP'}</span>
                    {card.risks?.canBackfire && (
                      <span className="risk-badge">⚠️</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fact-Check Rigors */}
      <div className="response-category">
        <h5 className="category-title">{lang.factCheckLabel || 'Fact-Check'}</h5>
        <div className="responses-grid">
          {availableRigors.factCheckRigors.map(rigor => {
            const selected = isSelected('factcheck', rigor.id);
            const affordable = canAfford(rigor.manpowerCost);
            
            return (
              <button
                key={rigor.id}
                onClick={() => onResponseToggle({
                  type: 'factcheck',
                  rigor: rigor.id,
                  manpower: rigor.manpowerCost
                })}
                className={`button response-button ${selected ? 'selected' : ''}`}
                disabled={!affordable && !selected}
              >
                {selected && <Check className="check-icon" />}
                <div className="response-content">
                  <span className="response-title">{rigor.title}</span>
                  <span className="response-cost">{rigor.manpowerCost} {lang.manpowerLabel || 'MP'}</span>
                  <span className="response-time">⏱️ {rigor.timeCost}h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discredit Source Rigors */}
      <div className="response-category">
        <h5 className="category-title">{lang.discreditLabel || 'Discredit Source'}</h5>
        <div className="responses-grid">
          {availableRigors.discreditRigors.map(rigor => {
            const selected = isSelected('discredit', rigor.id);
            const affordable = canAfford(rigor.manpowerCost);
            
            return (
              <button
                key={rigor.id}
                onClick={() => onResponseToggle({
                  type: 'discredit',
                  rigor: rigor.id,
                  manpower: rigor.manpowerCost
                })}
                className={`button response-button ${selected ? 'selected' : ''}`}
                disabled={!affordable && !selected}
              >
                {selected && <Check className="check-icon" />}
                <div className="response-content">
                  <span className="response-title">{rigor.title}</span>
                  <span className="response-cost">{rigor.manpowerCost} {lang.manpowerLabel || 'MP'}</span>
                  {rigor.risks?.canBackfire && (
                    <span className="risk-badge">⚠️ {Math.round(rigor.risks.backfireChance * 100)}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manpower Summary */}
      <div className="manpower-summary">
        <span className="manpower-label">{lang.manpowerAllocated || 'Allocated'}:</span>
        <span className="manpower-value">
          {getTotalManpowerCost()} / {manpower}
        </span>
        {getTotalManpowerCost() > manpower && (
          <span className="manpower-warning">⚠️ {lang.overBudget || 'Over budget!'}</span>
        )}
      </div>
    </div>
  );
}