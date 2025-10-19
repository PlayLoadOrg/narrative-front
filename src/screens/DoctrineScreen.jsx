// src/screens/DoctrineScreen.jsx
import React from 'react';
import doctrineData from '../data/AJP10summary.json';
import ParetoLogoSVG from '../assets/PSlogo.svg';

export function DoctrineScreen({ onReturn, hasGameState, i18n }) {
  return (
    <div className="card doctrine-card">
      <header className="card-header">
        <span/>
        <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
      </header>
      <div className="doctrine-content">
        {doctrineData.map((item, index) => {
          switch (item.type) {
            case 'title': 
              return <h1 key={index} className="doctrine-title">{item.text}</h1>;
            case 'subtitle': 
              return <h2 key={index} className="doctrine-subtitle">{item.text}</h2>;
            case 'heading': 
              return <h3 key={index} className="doctrine-heading">{item.text}</h3>;
            case 'paragraph': 
              return <p key={index} className="doctrine-paragraph">{item.text}</p>;
            case 'list': 
              return (
                <ul key={index} className="doctrine-list">
                  {item.items.map((li, i) => <li key={i}>{li}</li>)}
                </ul>
              );
            case 'definitions': 
              return (
                <dl key={index} className="doctrine-definitions">
                  {item.items.map((def, i) => (
                    <div key={i}>
                      <dt>{def.term}</dt>
                      <dd>{def.def}</dd>
                    </div>
                  ))}
                </dl>
              );
            case 'final_paragraph': 
              return <p key={index} className="doctrine-final-paragraph">{item.text}</p>;
            default: 
              return null;
          }
        })}
      </div>
      <div className="doctrine-footer">
        <button onClick={onReturn} className="button primary-button">
          {hasGameState ? i18n.doctrineReturn : i18n.doctrineProceed}
        </button>
      </div>
    </div>
  );
}