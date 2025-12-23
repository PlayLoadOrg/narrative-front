// src/screens/GameScreen.tsx
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SettingsMenu } from '../components/ui/SettingsMenu';
import { MeterDisplay } from '../components/game/MeterDisplay';
import { ManpowerDisplay } from '../components/game/ManpowerDisplay';
import { IntelligenceDashboard } from '../components/game/IntelligenceDashboard';
import { FilterChat, createFilterMessage } from '../components/game/FilterChat';
import { CardDraftPhase } from '../components/game/CardDraftPhase';
import { ResponsePanel } from '../components/game/ResponsePanel';
import { OutcomeScreen } from './OutcomeScreen';
import { useScenario } from '../hooks/useScenario';
import { useCards } from '../hooks/useCards';
import { useTranslation } from '../hooks/useTranslation';
import { useAudio } from '../hooks/useAudio';
import { useUIStore } from '../engine/uiStore';
import { OutcomeCalculator } from '../engine/resolver';
import { GAME_CONFIG, RESPONSE_TYPES } from '../engine/constants';
import type { PlayerResponse, AnticipationCard, AudioTrack } from '../engine/types';
import narrativeFrontLogo from '../assets/narrativeFront.svg';
import styles from './GameScreen.module.css';
import { PlayloadFooter } from '../components/ui/PlayloadFooter';

interface GameScreenProps {
  round: number;
  meter: number;
  manpower: number;
  preBunksUsed: string[];
  onMeterChange: (change: number) => void;
  onManpowerChange: (change: number) => void;
  onAdvanceRound: () => void;
  onRegisterPreBunk: (theme: string) => void;
  onRecordScenario: (scenario: any, responses: PlayerResponse[], outcome: any) => void;
  onGameEnd: () => void;
}

type GamePhaseType = 'anticipation' | 'transition' | 'reaction' | 'outcome';

export function GameScreen({
  round,
  meter,
  manpower,
  preBunksUsed,
  onMeterChange,
  onManpowerChange,
  onAdvanceRound,
  onRegisterPreBunk,
  onRecordScenario,
  onGameEnd
}: GameScreenProps) {
  const { t } = useTranslation();
  const { currentScenario, loading, loadScenario } = useScenario();
  const { drawCards } = useCards();
  
  // UI State
  const [gamePhase, setGamePhase] = useState<GamePhaseType>('anticipation');
  const [activeTab, setActiveTab] = useState<'scenario' | 'comms' | 'decision'>('scenario');
  const [showOutcome, setShowOutcome] = useState(false);
  
  // Card State
  const [draftCards, setDraftCards] = useState<AnticipationCard[]>([]);
  const [builtCards, setBuiltCards] = useState<AnticipationCard[]>([]);
  
  // Response State
  const [selectedResponses, setSelectedResponses] = useState<PlayerResponse[]>([]);
  const [currentOutcome, setCurrentOutcome] = useState<any>(null);
  
  // Filter Messages
  const [filterMessages, setFilterMessages] = useState<any[]>([]);
  
  // Audio & UI
  const { audio, toggleMute } = useUIStore();
  const audioPlayer = useAudio(audio.volume);
  
  // Outcome Calculator
  const [outcomeCalculator] = useState(() => new OutcomeCalculator());

  // Load scenario when round changes
  useEffect(() => {
    loadScenario(round);
    // Draw 3 cards for anticipation phase
    setDraftCards(drawCards(3));
    setGamePhase('anticipation');
    setSelectedResponses([]);
  }, [round, loadScenario, drawCards]);

  // Show Filter's briefing when entering reaction phase
  useEffect(() => {
    if (gamePhase === 'reaction' && currentScenario?.filter?.briefing) {
      const messages = [
        createFilterMessage(currentScenario.filter.briefing.preInject),
        createFilterMessage(currentScenario.filter.briefing.assessment)
      ];
      setFilterMessages(messages);
      setActiveTab('scenario');
    }
  }, [gamePhase, currentScenario]);

  // Start audio when game loads
  useEffect(() => {
    if (!audio.isMuted && !audioPlayer.isPlaying) {
      audioPlayer.play();
    }
  }, [audio.isMuted, audioPlayer]);

  // Handle audio track switching based on meter position
  useEffect(() => {
    // Determine which track should play based on meter value
    let targetTrack: AudioTrack;
    
    if (meter >= 3) {
      targetTrack = 'unity';
    } else if (meter <= -3) {
      targetTrack = 'fracturing';
    } else {
      targetTrack = 'neutral';
    }
    
    // Switch track if different from current
    if (targetTrack !== audioPlayer.currentTrack) {
      audioPlayer.switchTrack(targetTrack);
    }
  }, [meter, audioPlayer]);

  /**
   * Handle card selection during anticipation phase
   */
  const handleCardSelection = (card: AnticipationCard) => {
    // Deduct manpower
    onManpowerChange(-card.cost);
    
    // Add to built cards
    setBuiltCards(prev => [...prev, card]);
    
    // Register pre-bunk if applicable
    if (card.type === 'PREBUNK') {
      onRegisterPreBunk(card.targetTheme);
    }
    
    // Move to transition phase
    setGamePhase('transition');
  };

  /**
   * Handle transition continue (after anticipation)
   */
  const handleTransitionContinue = () => {
    setGamePhase('reaction');
  };

  /**
   * Handle response selection/removal
   */
  const handleSelectResponse = (response: PlayerResponse) => {
    const existing = selectedResponses.find(r => r.type === response.type);
    
    if (existing) {
      // Replace with new version (e.g., changing intensity)
      setSelectedResponses(prev => 
        prev.map(r => r.type === response.type ? response : r)
      );
    } else {
      // Add new response
      setSelectedResponses(prev => [...prev, response]);
    }
  };

  const handleRemoveResponse = (responseType: string) => {
    setSelectedResponses(prev => prev.filter(r => r.type !== responseType));
  };

  /**
   * Confirm responses and calculate outcome
   */
  const handleConfirmResponse = () => {
    if (!currentScenario) return;
    
    // If no responses selected, default to IGNORE
    const responses = selectedResponses.length > 0 
      ? selectedResponses 
      : [{ type: RESPONSE_TYPES.IGNORE, manpowerCost: 0 }];
    
    // Calculate outcome
    const outcome = outcomeCalculator.calculateOutcome(
      responses,
      currentScenario.inject.primary.intelligence,
      preBunksUsed,
      currentScenario.inject.primary.theme
    );
    
    // Record scenario history
    onRecordScenario(currentScenario, responses, outcome);
    
    // Store outcome and show outcome screen
    setCurrentOutcome(outcome);
    setShowOutcome(true);
  };

  /**
   * Continue from outcome screen
   */
  const handleOutcomeContinue = () => {
    if (!currentOutcome) return;
    
    // Apply meter change
    onMeterChange(currentOutcome.meterShift);
    
    // Deduct manpower
    onManpowerChange(-currentOutcome.manpowerCost);
    
    // Check if game is over
    if (round >= GAME_CONFIG.TOTAL_ROUNDS - 1) {
      onGameEnd();
      return;
    }
    
    // Advance to next round
    onAdvanceRound();
    
    // Reset UI state
    setShowOutcome(false);
    setCurrentOutcome(null);
    setSelectedResponses([]);
    setGamePhase('anticipation');
  };

  /**
   * Settings menu handlers
   */
  const handleSaveGame = () => {
    // Implementation through game store
    alert('Game saved!');
  };

  const handleLoadGame = () => {
    // Implementation through game store
    alert('Game loaded!');
  };

  const handleReturnToMenu = () => {
    if (confirm('Return to main menu? Progress will be lost unless saved.')) {
      window.location.hash = 'start';
    }
  };

  const handleOpenFrontopedia = () => {
    alert('Frontopedia coming soon!');
  };

  const handleToggleMute = () => {
    toggleMute();
    if (audio.isMuted) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  };

  /**
   * Calculate total manpower allocated
   */
  const getTotalAllocated = () => {
    return selectedResponses.reduce((sum, r) => sum + r.manpowerCost, 0);
  };

  /**
   * Check if confirm button should be enabled
   */
  const canConfirm = () => {
    const totalAllocated = getTotalAllocated();
    return totalAllocated <= manpower;
  };

  // Show outcome screen if active
  if (showOutcome && currentOutcome && currentScenario) {
    return (
      <OutcomeScreen
        outcome={currentOutcome}
        scenario={currentScenario}
        onContinue={handleOutcomeContinue}
      />
    );
  }

  // Show loading state
  if (loading || !currentScenario) {
    return (
      <div className="screen-container">
        <Card>
          <p>{t('ui.loading')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="screen-container">
      {/* Settings Menu */}
      <SettingsMenu
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        onReturnToMenu={handleReturnToMenu}
        onOpenFrontopedia={handleOpenFrontopedia}
        isMuted={audio.isMuted}
        onToggleMute={handleToggleMute}
      />

      <Card>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Shield className={styles.headerIcon} />
            <span className={styles.headerTitle}>{t('game.appTitle')}</span>
          </div>
          
          <img 
            src={narrativeFrontLogo} 
            alt="Narrative Front Logo" 
            className={styles.headerLogo} 
          />
        </header>

        <div className={styles.headerSubtitle}>{t('game.appSubtitle')}</div>

        {/* Resource Display */}
        <div className={styles.resourceDisplay}>
          <ManpowerDisplay amount={manpower} />
          <div className={styles.roundDisplay}>
            <span className={styles.resourceLabel}>{t('game.roundLabel')}:</span>
            <span className={styles.resourceValue}>
              {round + 1} {t('game.ofLabel')} {GAME_CONFIG.TOTAL_ROUNDS}
            </span>
          </div>
        </div>

        {/* Meter Display */}
        <MeterDisplay value={meter} />

        {/* ANTICIPATION PHASE */}
        {gamePhase === 'anticipation' && (
          <CardDraftPhase
            availableCards={draftCards}
            onConfirmSelection={handleCardSelection}
            availableManpower={manpower}
          />
        )}

        {/* TRANSITION PHASE */}
        {gamePhase === 'transition' && (
          <div className={styles.transitionPhase}>
            <div className={styles.transitionMessage}>
              <p className={styles.filterText}>
                Commander, our analysts believe they've identified the adversary's next narrative inject.
              </p>
              <Button
                onClick={handleTransitionContinue}
                variant="primary"
                fullWidth
              >
                OK
              </Button>
            </div>
          </div>
        )}

        {/* REACTION PHASE */}
        {gamePhase === 'reaction' && (
          <>
            {/* Tab Navigation */}
            <div className={styles.tabNavigation}>
              <button
                className={`${styles.tabButton} ${activeTab === 'scenario' ? styles.active : ''}`}
                onClick={() => setActiveTab('scenario')}
              >
                {t('game.tabScenario')}
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'comms' ? styles.active : ''}`}
                onClick={() => setActiveTab('comms')}
              >
                {t('game.tabComms')}
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'decision' ? styles.active : ''}`}
                onClick={() => setActiveTab('decision')}
              >
                {t('game.tabDecision')}
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {/* Scenario Tab */}
              {activeTab === 'scenario' && (
                <div className={styles.scenarioTab}>
                  {/* Adversary Inject */}
                  <div className={styles.injectSection}>
                    <div className={styles.injectHeader}>
                      <AlertTriangle className={styles.injectIcon} />
                      <h3 className={styles.injectTitle}>{t('game.adversaryInject')}</h3>
                    </div>
                    <p className={styles.injectText}>{currentScenario.inject.primary.text}</p>
                  </div>

                  {/* Intelligence Dashboard */}
                  <IntelligenceDashboard 
                    intelligence={currentScenario.inject.primary.intelligence} 
                  />
                </div>
              )}

              {/* Comms Tab - Filter's Guidance */}
              {activeTab === 'comms' && (
                <div className={styles.commsTab}>
                  <h3 className={styles.commsTabTitle}>{t('game.commsTitle')}</h3>
                  <FilterChat messages={filterMessages} />
                </div>
              )}

              {/* Decision Tab - Your Response Selection */}
              {activeTab === 'decision' && (
                <div className={styles.decisionTab}>
                  <h3 className={styles.decisionTabTitle}>{t('game.decisionTitle')}</h3>
                  
                  {/* Manpower Summary */}
                  <div className={styles.manpowerSummary}>
                    <span>{t('game.manpowerAllocated')}: {getTotalAllocated()} / {manpower}</span>
                  </div>

                  {/* Response Panel */}
                  <ResponsePanel
                    selectedResponses={selectedResponses}
                    availableManpower={manpower}
                    onSelectResponse={handleSelectResponse}
                    onRemoveResponse={handleRemoveResponse}
                    builtCards={builtCards}
                  />

                  {/* Confirm Button */}
                  <Button
                    onClick={handleConfirmResponse}
                    disabled={!canConfirm()}
                    variant="primary"
                    fullWidth
                  >
                    {selectedResponses.length === 0 
                      ? t('responses.noResponseSelected')
                      : t('game.confirmButton')
                    }
                  </Button>

                  {!canConfirm() && (
                    <p className={styles.errorText}>{t('responses.insufficientManpower')}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          {t('game.roundLabel')} {round + 1} {t('game.ofLabel')} {GAME_CONFIG.TOTAL_ROUNDS}
        </footer>
      </Card>
      <PlayloadFooter />
    </div>
  );
}