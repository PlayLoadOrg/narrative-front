// src/components/editor/ScenarioEditor.tsx
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IntelligenceEditor } from './IntelligenceEditor';
import type { Scenario } from '../../engine/types';
import styles from './ScenarioEditor.module.css';

interface ScenarioEditorProps {
  scenario: Scenario;
  onUpdate: (scenario: Scenario) => void;
  onDelete: () => void;
}

export function ScenarioEditor({ scenario, onUpdate, onDelete }: ScenarioEditorProps) {
  const handleFieldChange = (path: string[], value: any) => {
    const updated = { ...scenario };
    let current: any = updated;
    
    // Navigate to the nested field
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Update the field
    current[path[path.length - 1]] = value;
    
    onUpdate(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Round {scenario.round}</h3>
        <Button onClick={onDelete} variant="default">
          <Trash2 size={16} />
          Delete Round
        </Button>
      </div>

      {/* Scenario ID */}
      <div className={styles.field}>
        <label className={styles.label}>Scenario ID</label>
        <input
          type="text"
          value={scenario.id}
          onChange={(e) => handleFieldChange(['id'], e.target.value)}
          className={styles.input}
        />
      </div>

      {/* Inject Theme */}
      <div className={styles.field}>
        <label className={styles.label}>Theme</label>
        <select
          value={scenario.inject.primary.theme}
          onChange={(e) => handleFieldChange(['inject', 'primary', 'theme'], e.target.value)}
          className={styles.select}
        >
          <option value="scarcity">Scarcity</option>
          <option value="atrocity">Atrocity</option>
          <option value="betrayal">Betrayal</option>
          <option value="conspiracy">Conspiracy</option>
          <option value="incompetence">Incompetence</option>
        </select>
      </div>

      {/* Inject Text */}
      <div className={styles.field}>
        <label className={styles.label}>Adversary Inject (The disinformation narrative)</label>
        <textarea
          value={scenario.inject.primary.text}
          onChange={(e) => handleFieldChange(['inject', 'primary', 'text'], e.target.value)}
          className={styles.textarea}
          rows={4}
          placeholder="Enter the adversary's narrative..."
        />
      </div>

      {/* Intelligence Data */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Intelligence Assessment</h4>
        <IntelligenceEditor
          intelligence={scenario.inject.primary.intelligence}
          onUpdate={(intel) => handleFieldChange(['inject', 'primary', 'intelligence'], intel)}
        />
      </div>

      {/* Filter Briefing */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Filter's Guidance</h4>
        
        <div className={styles.field}>
          <label className={styles.label}>Pre-Inject Briefing</label>
          <textarea
            value={scenario.filter.briefing.preInject}
            onChange={(e) => handleFieldChange(['filter', 'briefing', 'preInject'], e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Filter's introduction before seeing the inject..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Assessment</label>
          <textarea
            value={scenario.filter.briefing.assessment}
            onChange={(e) => handleFieldChange(['filter', 'briefing', 'assessment'], e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Filter's analysis of the threat..."
          />
        </div>
      </div>

      {/* Outcomes */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Meter Impact Values</h4>
        
        <div className={styles.outcomeGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Success Impact</label>
            <input
              type="number"
              value={scenario.outcomes.meterImpact.success}
              onChange={(e) => handleFieldChange(['outcomes', 'meterImpact', 'success'], parseInt(e.target.value))}
              className={styles.inputSmall}
              min="-10"
              max="10"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Neutral Impact</label>
            <input
              type="number"
              value={scenario.outcomes.meterImpact.neutral}
              onChange={(e) => handleFieldChange(['outcomes', 'meterImpact', 'neutral'], parseInt(e.target.value))}
              className={styles.inputSmall}
              min="-10"
              max="10"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Failure Impact</label>
            <input
              type="number"
              value={scenario.outcomes.meterImpact.failure}
              onChange={(e) => handleFieldChange(['outcomes', 'meterImpact', 'failure'], parseInt(e.target.value))}
              className={styles.inputSmall}
              min="-10"
              max="10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}