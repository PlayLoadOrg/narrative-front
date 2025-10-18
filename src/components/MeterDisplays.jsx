import React from 'react';
import { Brain } from 'lucide-react';

export const TugOfWarBar = ({ value, lang }) => {
  const percentage = ((value + 5) / 10) * 100;
  return (
    <div className="tug-of-war-container">
      <div className="tug-of-war-bar">
        <div className="bar-color-fill" style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}/>
        <div className="bar-marker" style={{ left: `${percentage}%` }}>
          <div className="bar-marker-orb" />
        </div>
      </div>
      <div className="bar-labels">
        <span className="label-fragmentation">{lang.fragmentationLabel}</span>
        <span className="label-neutral">{lang.neutralLabel}</span>
        <span className="label-unity">{lang.unityLabel}</span>
      </div>
      <div className="meter-value">{lang.meterLabel} {value > 0 ? '+' : ''}{value}</div>
    </div>
  );
};

export const BrainMeter = ({ value, lang }) => {
  const getColor = () => {
    if (value <= -2) return '#ef4444';
    if (value >= 2) return '#06b6d4';
    return '#6b7280';
  };
  
  const getLabel = () => {
    if (value <= -2) return lang.brainStateFragmented;
    if (value >= 2) return lang.brainStateResilient;
    return lang.brainStateNeutral;
  };
  
  return (
    <div className="brain-meter-container">
      <div className="brain-icon-wrapper">
        <Brain 
          size={120} 
          color={getColor()} 
          strokeWidth={2}
          fill={getColor()}
          fillOpacity={0.2}
        />
      </div>
      <div className="bar-labels">
        <span className="label-fragmentation">{lang.fragmentationLabel}</span>
        <span className="label-neutral">{lang.neutralLabel}</span>
        <span className="label-unity">{lang.unityLabel}</span>
      </div>
      <div className="meter-value" style={{ color: getColor() }}>
        {getLabel()} ({value > 0 ? '+' : ''}{value})
      </div>
    </div>
  );
};

export const MapMeter = ({ value, lang }) => {
  const getColor = () => {
    if (value <= -2) return '#ef4444';
    if (value >= 2) return '#06b6d4';
    return '#6b7280';
  };
  
  const getLabel = () => {
    if (value <= -2) return lang.mapStateUnstable;
    if (value >= 2) return lang.mapStateSecure;
    return lang.mapStateContested;
  };
  
  return (
    <div className="map-meter-container">
      <svg viewBox="0 0 400 300" className="region-map">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: getColor(), stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: getColor(), stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>
        
        <path 
          d="M 200,40 L 340,110 L 310,250 L 90,250 L 60,110 Z"
          fill="url(#mapGradient)"
          stroke={getColor()}
          strokeWidth="4"
        />
        
        <line x1="200" y1="40" x2="200" y2="250" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
        <line x1="60" y1="180" x2="340" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
        
        <circle cx="200" cy="150" r="8" fill={getColor()} stroke="#1e293b" strokeWidth="2" />
      </svg>
      
      <div className="bar-labels">
        <span className="label-fragmentation">{lang.fragmentationLabel}</span>
        <span className="label-neutral">{lang.neutralLabel}</span>
        <span className="label-unity">{lang.unityLabel}</span>
      </div>
      <div className="meter-value" style={{ color: getColor() }}>
        {getLabel()} ({value > 0 ? '+' : ''}{value})
      </div>
    </div>
  );
};

export const MeterDisplay = ({ value, meterType, lang }) => {
  switch(meterType) {
    case 'brain':
      return <BrainMeter value={value} lang={lang} />;
    case 'map':
      return <MapMeter value={value} lang={lang} />;
    case 'tugofwar':
    default:
      return <TugOfWarBar value={value} lang={lang} />;
  }
};