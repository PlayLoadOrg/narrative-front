// src/components/DeckBuilder.jsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export function DeckBuilder({ currentDeck, availableCards, manpower, onFinish, lang }) {
  const [tempDeck, setTempDeck] = useState(currentDeck);
  const [selectedCategory, setSelectedCategory] = useState('prebunks');

  // Draw 3 random cards from the available pool
  const [drawnCards] = useState(() => {
    const category = selectedCategory === 'prebunks' ? 
      availableCards.prebunks : availableCards.counterNarratives;
    
    const shuffled = [...category].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const addToDeck = (card) => {
    const category = selectedCategory;
    if (!tempDeck[category].find(c => c.id === card.id)) {
      setTempDeck({
        ...tempDeck,
        [category]: [...tempDeck[category], card]
      });
    }
  };

  const removeFromDeck = (cardId) => {
    const category = selectedCategory;
    setTempDeck({
      ...tempDeck,
      [category]: tempDeck[category].filter(c => c.id !== cardId)
    });
  };

  return (
    <div className="card deck-builder-card">
      <h2>{lang.deckBuilderTitle || 'Prepare Your Responses'}</h2>
      <p>{lang.deckBuilderInstructions || 'Select cards to add to your deck for the next round.'}</p>

      <div className="category-selector">
        <button 
          className={`button ${selectedCategory === 'prebunks' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('prebunks')}
        >
          {lang.prebunksLabel || 'Pre-bunks'}
        </button>
        <button 
          className={`button ${selectedCategory === 'counterNarratives' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('counterNarratives')}
        >
          {lang.counterNarrativesLabel || 'Counter-Narratives'}
        </button>
      </div>

      <div className="drawn-cards">
        <h3>{lang.availableCards || 'Available Cards'}</h3>
        {drawnCards.map(card => (
          <div key={card.id} className="card-option">
            <div className="card-info">
              <h4>{card.title}</h4>
              <p>{card.description}</p>
              <span className="card-cost">{lang.manpowerCost || 'Cost'}: {card.manpowerCost}</span>
              {card.risks?.canBackfire && (
                <span className="card-warning">⚠️ {lang.riskWarning || 'Risky'}</span>
              )}
            </div>
            <button onClick={() => addToDeck(card)} className="button">
              <Plus /> {lang.addButton || 'Add'}
            </button>
          </div>
        ))}
      </div>

      <div className="current-deck">
        <h3>{lang.yourDeck || 'Your Deck'}</h3>
        {tempDeck[selectedCategory].map(card => (
          <div key={card.id} className="deck-card">
            <span>{card.title}</span>
            <button onClick={() => removeFromDeck(card.id)} className="button">
              <X />
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => onFinish(tempDeck)} className="button primary-button full-width">
        {lang.continueButton || 'Continue to Next Round'}
      </button>
    </div>
  );
}