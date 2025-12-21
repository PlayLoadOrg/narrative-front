// src/screens/EditorScreen.tsx
import { useState } from 'react';
import { Plus, Download, Upload, Play, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScenarioEditor } from '../components/editor/ScenarioEditor';
import { exportCampaign } from '../utils/exportScenario';
import type { Campaign, Scenario } from '../engine/types';
import campaignTemplate from '../data/campaigns/campaign_01.json';
import styles from './EditorScreen.module.css';
import { PlayloadFooter } from '../components/ui/PlayloadFooter';

interface EditorScreenProps {
  onExit: () => void;
  onTestScenario?: (scenario: Scenario) => void;
}

export function EditorScreen({ onExit, onTestScenario }: EditorScreenProps) {
  const [campaign, setCampaign] = useState<Campaign>(campaignTemplate as Campaign);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(null);

  /**
   * Add new scenario
   */
  const handleAddScenario = () => {
    const newRound = campaign.scenarios.length + 1;
    
    const newScenario: Scenario = {
      id: `scenario-${newRound}`,
      round: newRound,
      inject: {
        primary: {
          theme: 'scarcity',
          text: 'Enter your adversary narrative here...',
          intelligence: {
            hoursActive: 24,
            botAmplification: 50,
            damagePotential: 5,
            veracity: 'False',
            emotionalResonance: 5,
            sourceType: 'bot_network'
          }
        }
      },
      filter: {
        briefing: {
          preInject: 'Filter briefing before inject...',
          assessment: 'Filter assessment of the threat...'
        }
      },
      outcomes: {
        meterImpact: {
          success: 2,
          neutral: 0,
          failure: -2
        }
      }
    };

    setCampaign({
      ...campaign,
      scenarios: [...campaign.scenarios, newScenario]
    });
  };

  /**
   * Delete scenario
   */
  const handleDeleteScenario = (index: number) => {
    const updated = campaign.scenarios.filter((_, i) => i !== index);
    
    // Renumber rounds
    const renumbered = updated.map((s, i) => ({
      ...s,
      round: i + 1
    }));

    setCampaign({
      ...campaign,
      scenarios: renumbered
    });

    if (selectedScenarioIndex === index) {
      setSelectedScenarioIndex(null);
    }
  };

  /**
   * Update scenario
   */
  const handleUpdateScenario = (index: number, scenario: Scenario) => {
    const updated = [...campaign.scenarios];
    updated[index] = scenario;
    
    setCampaign({
      ...campaign,
      scenarios: updated
    });
  };

  /**
   * Export campaign as JSON
   */
  const handleExport = () => {
    exportCampaign(campaign, 'narrative-front-campaign.json');
  };

  /**
   * Import campaign from JSON file
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setCampaign(imported);
        alert('Campaign imported successfully!');
      } catch (error) {
        alert('Failed to import campaign. Invalid JSON file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Test selected scenario
   */
  const handleTestScenario = () => {
    if (selectedScenarioIndex !== null && onTestScenario) {
      onTestScenario(campaign.scenarios[selectedScenarioIndex]);
    }
  };

  return (
    <div className="screen-container">
      <Card>
        <div className={styles.header}>
          <Button onClick={onExit} variant="default">
            <ArrowLeft size={16} />
            Exit Editor
          </Button>
          
          <h1 className={styles.title}>Campaign Editor</h1>
          
          <div className={styles.actions}>
            <label className={styles.uploadButton}>
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
            
            <Button onClick={handleExport} variant="default">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Campaign Info */}
        <div className={styles.campaignInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Campaign:</span>
            <input
              type="text"
              value={campaign.meta.title}
              onChange={(e) => setCampaign({
                ...campaign,
                meta: { ...campaign.meta, title: e.target.value }
              })}
              className={styles.input}
            />
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Description:</span>
            <textarea
              value={campaign.meta.description}
              onChange={(e) => setCampaign({
                ...campaign,
                meta: { ...campaign.meta, description: e.target.value }
              })}
              className={styles.textarea}
              rows={2}
            />
          </div>
        </div>

        {/* Scenario List */}
        <div className={styles.scenarioList}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Scenarios ({campaign.scenarios.length})</h2>
            <Button onClick={handleAddScenario} variant="primary">
              <Plus size={16} />
              Add Scenario
            </Button>
          </div>

          {campaign.scenarios.length === 0 && (
            <p className={styles.emptyState}>No scenarios yet. Click "Add Scenario" to create one.</p>
          )}

          {campaign.scenarios.map((scenario, index) => (
            <div key={scenario.id} className={styles.scenarioItem}>
              <button
                className={`${styles.scenarioButton} ${selectedScenarioIndex === index ? styles.active : ''}`}
                onClick={() => setSelectedScenarioIndex(index)}
              >
                <div className={styles.scenarioHeader}>
                  <span className={styles.scenarioRound}>Round {scenario.round}</span>
                  <span className={styles.scenarioTheme}>{scenario.inject.primary.theme}</span>
                </div>
                <p className={styles.scenarioPreview}>
                  {scenario.inject.primary.text.substring(0, 80)}...
                </p>
              </button>
            </div>
          ))}
        </div>

        {/* Selected Scenario Editor */}
        {selectedScenarioIndex !== null && (
          <div className={styles.editorSection}>
            <div className={styles.editorHeader}>
              <h2 className={styles.editorTitle}>Editing Round {campaign.scenarios[selectedScenarioIndex].round}</h2>
              {onTestScenario && (
                <Button onClick={handleTestScenario} variant="primary">
                  <Play size={16} />
                  Test Scenario
                </Button>
              )}
            </div>
            
            <ScenarioEditor
              scenario={campaign.scenarios[selectedScenarioIndex]}
              onUpdate={(updated) => handleUpdateScenario(selectedScenarioIndex, updated)}
              onDelete={() => handleDeleteScenario(selectedScenarioIndex)}
            />
          </div>
        )}
      </Card>
      <PlayloadFooter />
    </div>
  );
}