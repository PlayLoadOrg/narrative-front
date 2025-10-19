// src/screens/BriefingScreen.jsx
import React from 'react';
import { Typewriter } from '../components/Typewriter';
import ParetoLogoSVG from '../assets/PSlogo.svg';

export function BriefingScreen({ onLearn, onStart, i18n }) {
  return (
    <div className="card briefing-card">
      <header className="card-header">
        <span/>
        <img src={ParetoLogoSVG} alt="Logo" className="header-logo" />
      </header>
      <div className="briefing-quote">
        <Typewriter text='"In war, truth is the first casualty."' speed={50} />
        <div className="briefing-attribution">— Aeschylus</div>
      </div>
      <p className="briefing-text">
        Welcome to Narrative Front, a training simulation based on real NATO StratCom doctrine. 
        In the information battlefield, lies spread faster than truth—but you're not defenseless. 
        Learn to recognize, counter, and neutralize disinformation before it fractures alliances 
        and destroys trust. Your decisions matter. Are you ready?
      </p>
      <div className="choice-button-container">
        <button onClick={onLearn} className="button choice-button">
          {i18n.learnButton}
        </button>
        <button onClick={onStart} className="button choice-button primary-button">
          {i18n.trialsButton}
        </button>
      </div>
    </div>
  );
}