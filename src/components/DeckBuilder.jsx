// src/components/DeckBuilder.jsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export function DeckBuilder({ currentDeck, availableCards, manpower, onFinish, i18n }) {
  const [tempDeck, setTempDeck] = useState(currentDeck);
  const [selectedCategory, setSelectedCategory] = useState('prebunks');
  const [hasSelectedCard, setHasSelectedCard] = useState(false);

  // Draw 3 random cards from EACH category separately
  const [drawnPrebunks] = useState(() => {
    const available = availableCards.prebunks.filter(card => 
      !currentDeck.prebunks.find(c => c.id === card.id)
    );
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  });

  const [drawnCounterNarratives] = useState(() => {
    const available = availableCards.counterNarratives.filter(card => 
      !currentDeck.counterNarratives.find(c => c.id === card.id)
    );
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  });

  const drawnCards = selectedCategory === 'prebunks' ? drawnPrebunks : drawnCounterNarratives;

  const addToDeck = (card) => {
    if (hasSelectedCard) return; // Already selected one card this round
    
    const category = selectedCategory;
    if (!tempDeck[category].find(c => c.id === card.id)) {
      setTempDeck({
        ...tempDeck,
        [category]: [...tempDeck[category], card]
      });
      setHasSelectedCard(true);
    }
  };

  const removeFromDeck = (cardId) => {
    const category = selectedCategory;
    const cardToRemove = tempDeck[category].find(c => c.id === cardId);
    
    // Check if this card was added this round (is it in the drawn cards?)
    const wasDrawnThisRound = drawnCards.some(c => c.id === cardId);
    
    setTempDeck({
      ...tempDeck,
      [category]: tempDeck[category].filter(c => c.id !== cardId)
    });
    
    // If we're removing a card that was drawn this round, allow selecting another
    if (wasDrawnThisRound) {
      setHasSelectedCard(false);
    }
  };

  const handleSkip = () => {
    onFinish(tempDeck);
  };

  return (
    <div className="card deck-builder-card">
      <div className="deck-builder-header">
        <h2>{i18n.deckBuilderTitle || 'Prepare Your Responses'}</h2>
        <div className="resource-display-inline">
          <span className="resource-item">{i18n.manpowerLabel || 'Manpower'}: {manpower}</span>
        </div>
      </div>
      
      <p style={{ marginBottom: '1.5rem', color: 'var(--gray-300)' }}>
        {i18n.deckBuilderInstructions || 'Select ONE card to add to your deck (or skip).'}
      </p>

      {hasSelectedCard && (
        <div className="deck-builder-notice">
          ✓ Card selected! You can change your selection or continue.
        </div>
      )}

      <div className="category-selector">
        <button 
          className={`button ${selectedCategory === 'prebunks' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('prebunks')}
        >
          {i18n.prebunksLabel || 'Pre-bunks'}
        </button>
        <button 
          className={`button ${selectedCategory === 'counterNarratives' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('counterNarratives')}
        >
          {i18n.counterNarrativesLabel || 'Counter-Narratives'}
        </button>
      </div>

      {drawnCards.length > 0 ? (
        <div className="drawn-cards">
          <h3>{i18n.availableCards || 'Available Cards'} ({selectedCategory === 'prebunks' ? 'Pre-bunks' : 'Counter-Narratives'})</h3>
          {drawnCards.map(card => {
            const isInDeck = tempDeck[selectedCategory].find(c => c.id === card.id);
            const isNewlyAdded = isInDeck && drawnCards.some(c => c.id === card.id);
            
            return (
              <div key={card.id} className={`card-option ${isNewlyAdded ? 'newly-added' : ''}`}>
                <div className="card-info">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                  <div className="card-meta">
                    <span className="card-cost">
                      {i18n.manpowerCost || 'Cost'}: {card.manpowerCost} MP
                    </span>
                    {card.risks?.canBackfire && (
                      <span className="card-warning">
                        ⚠️ {i18n.riskWarning || 'Can backfire'}
                      </span>
                    )}
                  </div>
                </div>
                {isNewlyAdded ? (
                  <button 
                    onClick={() => removeFromDeck(card.id)} 
                    className="button button-remove"
                    style={{ minWidth: '100px' }}
                  >
                    <X size={16} /> {i18n.removeButton || 'Remove'}
                  </button>
                ) : (
                  <button 
                    onClick={() => addToDeck(card)} 
                    className="button"
                    style={{ minWidth: '100px' }}
                    disabled={hasSelectedCard}
                  >
                    <Plus size={16} /> {i18n.addButton || 'Add'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
          <p>No new {selectedCategory === 'prebunks' ? 'pre-bunks' : 'counter-narratives'} available.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            You already have all available cards in this category.
          </p>
        </div>
      )}

      <div className="current-deck">
        <h3>{i18n.yourDeck || 'Your Full Deck'}</h3>
        <div className="deck-summary">
          <div className="deck-category-summary">
            <strong>Pre-bunks ({tempDeck.prebunks.length}):</strong>
            {tempDeck.prebunks.length === 0 ? (
              <span style={{ color: 'var(--gray-500)', marginLeft: '0.5rem' }}>None</span>
            ) : (
              <div className="deck-list-compact">
                {tempDeck.prebunks.map(card => (
                  <span key={card.id} className="deck-tag">
                    {card.title}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="deck-category-summary">
            <strong>Counter-Narratives ({tempDeck.counterNarratives.length}):</strong>
            {tempDeck.counterNarratives.length === 0 ? (
              <span style={{ color: 'var(--gray-500)', marginLeft: '0.5rem' }}>None</span>
            ) : (
              <div className="deck-list-compact">
                {tempDeck.counterNarratives.map(card => (
                  <span key={card.id} className="deck-tag">
                    {card.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="deck-builder-actions">
        <button 
          onClick={handleSkip} 
          className="button"
          style={{ flex: 1 }}
        >
          {i18n.skipButton || 'Skip (No Card)'}
        </button>
        <button 
          onClick={() => onFinish(tempDeck)} 
          className="button primary-button"
          style={{ flex: 2 }}
        >
          {i18n.continueButton || 'Continue to Next Round'}
        </button>
      </div>
    </div>
  );
}