// src/screens/StartScreen.jsx
import React from 'react';
import ParetoLogoSVG from '../assets/PSlogo.svg';

export function StartScreen({ onStart, i18n }) {
  return (
    <div className="card start-card">
      <img src={ParetoLogoSVG} alt="Logo" className="logo" />
      <div className="brand-text">{i18n.presenter}</div>
      <div className="credit-text">{i18n.credits}</div>
      <div className="title-container">
        <h1 className="main-title">{i18n.appTitle}</h1>
      </div>
      <div className="disclaimer-text">{i18n.disclaimer}</div>
      <button onClick={onStart} className="button primary-button">
        {i18n.swearButton}
      </button>
    </div>
  );
}