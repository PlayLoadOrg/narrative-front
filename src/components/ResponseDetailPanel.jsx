// src/components/ResponseDetailPanel.jsx
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

export function ResponseDetailPanel({ 
  category, 
  playerDeck, 
  proceduralComponents,
  manpower,
  onSelect, 
  onClose,
  onCancel,
  i18n 
}) {
  if (!category) return null;

  let options = [];
  let title = '';

  switch(category) {
    case 'prebunk':
      title = i18n.prebunksLabel || 'Pre-bunks';
      options = playerDeck.prebunks.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        manpower: card.manpowerCost,
        card: card.id,
        risk: card.risks?.canBackfire
      }));
      break;
    case 'counter_narrative':
      title = i18n.counterNarrativesLabel || 'Counter-Narratives';
      options = playerDeck.counterNarratives.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        manpower: card.manpowerCost,
        card: card.id,
        risk: card.risks?.canBackfire
      }));
      break;
    case 'factcheck':
      title = i18n.factCheckLabel || 'Fact-Check';
      options = proceduralComponents.factCheckRigors.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        manpower: r.manpowerCost,
        time: r.timeCost,
        rigor: r.id
      }));
      break;
    case 'discredit':
      title = i18n.discreditLabel || 'Discredit Source';
      options = proceduralComponents.discreditRigors.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        manpower: r.manpowerCost,
        risk: r.risks?.backfireChance,
        rigor: r.id
      }));
      break;
  }

  return (
    <>
      <div className="detail-overlay" onClick={onClose} />
      <div className="detail-panel slide-in-right">
        <div className="detail-header">
          <button className="detail-back" onClick={onClose}>
            <ArrowLeft size={20} /> Back
          </button>
          {onCancel && (
            <button className="detail-cancel" onClick={() => onCancel(category)}>
              <X size={20} /> Cancel Selection
            </button>
          )}
          <h4>{title}</h4>
        </div>
        
        {options.length === 0 && (category === 'prebunk' || category === 'counter_narrative') && (
          <div className="empty-deck-message">
            <p>No {title.toLowerCase()} in your deck yet.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>
              Earn cards by performing well in scenarios.
            </p>
          </div>
        )}
        
        <div className="detail-options">
          {options.map(option => {
            const canAfford = manpower >= option.manpower;
            return (
              <button
                key={option.id}
                className={`button response-option ${!canAfford ? 'disabled' : ''}`}
                onClick={() => canAfford && onSelect(category, option)}
                disabled={!canAfford}
              >
                <div className="option-title">{option.title}</div>
                {option.description && (
                  <div className="option-description">{option.description}</div>
                )}
                <div className="option-details">
                  <span className="option-cost">{option.manpower} MP</span>
                  {option.time && <span className="option-time">⏱️ {option.time}h</span>}
                  {option.risk && (
                    <span className="option-risk">
                      ⚠️ {typeof option.risk === 'number' ? Math.round(option.risk * 100) + '%' : 'Risky'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}