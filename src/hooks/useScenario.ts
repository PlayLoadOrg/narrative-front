// src/hooks/useScenario.ts

import { useState, useCallback } from 'react';
import type { Scenario } from '../engine/types';

/**
 * Hook for loading and managing scenarios
 */
export function useScenario() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load a scenario by round number
   */
  const loadScenario = useCallback(async (round: number, _language: string = 'en') => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamic import to avoid type issues
      const { default: campaignData } = await import('../data/campaigns/campaign_01.json');
      
      // Find scenario matching the round
      const scenario = campaignData.scenarios.find(
        (s: any) => s.round === round + 1 // rounds are 1-indexed in JSON
      );
      
      if (!scenario) {
        throw new Error(`Scenario not found for round ${round + 1}`);
      }
      
      setCurrentScenario(scenario as Scenario);
    } catch (err) {
      console.error('Failed to load scenario:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setCurrentScenario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Preload next scenario for smooth transitions
   */
  const preloadNextScenario = useCallback(async (currentRound: number, _language: string = 'en') => {
    try {
      const { default: campaignData } = await import('../data/campaigns/campaign_01.json');
      const nextRound = currentRound + 1;
      const nextScenario = campaignData.scenarios.find(
        (s: any) => s.round === nextRound + 1
      );
      
      if (nextScenario) {
        console.log(`Preloaded scenario for round ${nextRound + 1}`);
      }
    } catch (err) {
      console.error('Failed to preload scenario:', err);
    }
  }, []);

  return {
    currentScenario,
    loading,
    error,
    loadScenario,
    preloadNextScenario,
  };
}