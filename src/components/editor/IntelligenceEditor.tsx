// src/components/editor/IntelligenceEditor.tsx
import type { IntelligenceData } from '../../engine/types';
import styles from './IntelligenceEditor.module.css';

interface IntelligenceEditorProps {
  intelligence: IntelligenceData;
  onUpdate: (intelligence: IntelligenceData) => void;
}

export function IntelligenceEditor({ intelligence, onUpdate }: IntelligenceEditorProps) {
  const handleChange = (field: keyof IntelligenceData, value: any) => {
    onUpdate({
      ...intelligence,
      [field]: value
    });
  };

  return (
    <div className={styles.grid}>
      {/* Hours Active */}
      <div className={styles.field}>
        <label className={styles.label}>
          Hours Active: {intelligence.hoursActive}h
        </label>
        <input
          type="range"
          min="0"
          max="120"
          value={intelligence.hoursActive}
          onChange={(e) => handleChange('hoursActive', parseInt(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderHint}>0-12h: Fresh | 12-48h: Normal | 48-96h: Hardened | 96h+: Entrenched</div>
      </div>

      {/* Bot Amplification */}
      <div className={styles.field}>
        <label className={styles.label}>
          Bot Amplification: {intelligence.botAmplification}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={intelligence.botAmplification}
          onChange={(e) => handleChange('botAmplification', parseInt(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderHint}>0-30%: Organic | 30-60%: Mixed | 60%+: Coordinated</div>
      </div>

      {/* Damage Potential */}
      <div className={styles.field}>
        <label className={styles.label}>
          Damage Potential: {intelligence.damagePotential}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={intelligence.damagePotential}
          onChange={(e) => handleChange('damagePotential', parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      {/* Emotional Resonance */}
      <div className={styles.field}>
        <label className={styles.label}>
          Emotional Resonance: {intelligence.emotionalResonance}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={intelligence.emotionalResonance}
          onChange={(e) => handleChange('emotionalResonance', parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      {/* Veracity */}
      <div className={styles.field}>
        <label className={styles.label}>Veracity</label>
        <select
          value={intelligence.veracity}
          onChange={(e) => handleChange('veracity', e.target.value)}
          className={styles.select}
        >
          <option value="False">False</option>
          <option value="Misleading">Misleading</option>
          <option value="True">True</option>
        </select>
      </div>

      {/* Source Type */}
      <div className={styles.field}>
        <label className={styles.label}>Source Type</label>
        <select
          value={intelligence.sourceType}
          onChange={(e) => handleChange('sourceType', e.target.value)}
          className={styles.select}
        >
          <option value="local_organic">Local Organic</option>
          <option value="bot_network">Bot Network</option>
          <option value="state_media">State Media</option>
        </select>
      </div>
    </div>
  );
}