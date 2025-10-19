// src/components/SettingsMenu.jsx
import React from 'react';
import { X, VolumeX, Volume2, BookOpen, RotateCcw, Globe, BarChart3 } from 'lucide-react';
import { LANGUAGES, METER_TYPES } from '../constants';

export function SettingsMenu({ 
  isOpen,
  onClose, 
  isMuted, 
  setIsMuted, 
  language, 
  setLanguage, 
  meterType, 
  setMeterType,
  onStudyDoctrine,
  onNewRun,
  i18n
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-menu slide-in">
        <button className="settings-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h3 className="settings-title">{i18n.settingsTitle}</h3>
        
        <button className="button settings-button" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX/> : <Volume2/>} 
          {isMuted ? i18n.settingsSoundOff : i18n.settingsSoundOn}
        </button>
        
        <div className="settings-section">
          <div className="settings-section-label">
            <Globe size={16} /> {i18n.settingsLanguage}
          </div>
          <div className="settings-button-group">
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                className={`button settings-button-small ${language === code ? 'active' : ''}`}
                onClick={() => setLanguage(code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-section-label">
            <BarChart3 size={16} /> {i18n.settingsMeterStyle}
          </div>
          <div className="settings-button-group">
            {METER_TYPES.map((type) => (
              <button
                key={type}
                className={`button settings-button-small ${meterType === type ? 'active' : ''}`}
                onClick={() => setMeterType(type)}
              >
                {i18n[`meterDisplay${type.charAt(0).toUpperCase() + type.slice(1)}`] || type}
              </button>
            ))}
          </div>
        </div>
        
        <button className="button settings-button" onClick={onStudyDoctrine}>
          <BookOpen/> {i18n.settingsStudy}
        </button>
        <button className="button settings-button" onClick={onNewRun}>
          <RotateCcw/> {i18n.settingsNewRun}
        </button>
      </div>
    </>
  );
}