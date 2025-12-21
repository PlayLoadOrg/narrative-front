// src/utils/exportScenario.ts

import type { Campaign } from '../engine/types';

/**
 * Export campaign to JSON file
 */
export function exportCampaign(campaign: Campaign, filename: string = 'campaign.json'): void {
  // Validate campaign structure
  validateCampaign(campaign);
  
  // Convert to JSON with formatting
  const json = JSON.stringify(campaign, null, 2);
  
  // Create blob and download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Validate campaign structure
 */
function validateCampaign(campaign: Campaign): void {
  if (!campaign.meta) {
    throw new Error('Campaign must have meta section');
  }
  
  if (!campaign.scenarios || campaign.scenarios.length === 0) {
    throw new Error('Campaign must have at least one scenario');
  }
  
  // Validate each scenario
  campaign.scenarios.forEach((scenario, index) => {
    if (!scenario.id) {
      throw new Error(`Scenario ${index + 1} missing id`);
    }
    
    if (!scenario.inject?.primary?.text) {
      throw new Error(`Scenario ${index + 1} missing inject text`);
    }
    
    if (!scenario.inject?.primary?.intelligence) {
      throw new Error(`Scenario ${index + 1} missing intelligence data`);
    }
    
    if (!scenario.filter?.briefing) {
      throw new Error(`Scenario ${index + 1} missing filter briefing`);
    }
    
    if (!scenario.outcomes?.meterImpact) {
      throw new Error(`Scenario ${index + 1} missing outcomes`);
    }
  });
}