// src/screens/BriefingScreen.jsx
import React from 'react';
import { Typewriter } from '../components/Typewriter';
import NarrativeFrontLogo from '../assets/narrativeFront.svg';

export function BriefingScreen({ onLearn, onStart, i18n }) {
  return (
    <div className="card briefing-card">
      <header className="card-header">
        <span/>
        <img src={NarrativeFrontLogo} alt="Logo" className="header-logo" />
      </header>
      <div className="briefing-quote">
        <Typewriter text='"In war, truth is the first casualty."' speed={50} />
        <div className="briefing-attribution">— Aeschylus</div>
      </div>
      <div className="briefing-container">
      <h3 className="briefing-title">THE BATTLEFIELD HAS CHANGED.</h3>
      
      <p>Today's war is fought with narratives. Hostile actors are using disinformation to attack our society's most critical asset: <strong>trust</strong>.</p>

      <h4 className="briefing-subtitle">YOUR MISSION:</h4>
      <p>Defend the information space during a critical NATO peacekeeping exercise.</p>

      <h4 className="briefing-subtitle">THE THREAT:</h4>
      <p>Adversaries are deploying 'injects'—targeted lies and propaganda—to create chaos and division.</p>

      <h4 className="briefing-subtitle">YOUR ROLE:</h4>
      <p>Analyze each inject and deploy countermeasures. Your choices will either push our society towards <strong>FRAGMENTATION</strong> or build its <strong>UNITY</strong>.</p>
      </div>
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