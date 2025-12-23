// src/screens/BriefingScreen.tsx
import { useState, useEffect } from 'react';
import { PlayloadFooter } from '../components/ui/PlayloadFooter';
import { Button } from '../components/ui/Button';
import { Typewriter } from '../components/game/Typewriter';
import { useTranslation } from '../hooks/useTranslation';
import styles from './BriefingScreen.module.css';

interface BriefingScreenProps {
  onStart: () => void;
}

export function BriefingScreen({ onStart }: BriefingScreenProps) {
  const { t } = useTranslation();
  const [showQuote, setShowQuote] = useState(false);
  const [quoteComplete, setQuoteComplete] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Start showing quote after brief delay
    const timer = setTimeout(() => setShowQuote(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleQuoteComplete = () => {
    setQuoteComplete(true);
    // Show briefing text after quote completes
    setTimeout(() => setShowBriefing(true), 500);
  };

  const handleBriefingComplete = () => {
    setShowButton(true);
  };

  return (
    <div className="screen-container">
      <div className={styles.card}>
        <div className={styles.quote}>
          {showQuote && (
            <Typewriter 
              text={t('briefing.quote')}
              speed={80} // Slower for dramatic effect
              onComplete={handleQuoteComplete}
            />
          )}
        </div>
        
        {quoteComplete && (
          <div className={styles.attribution}>
            {t('briefing.attribution')}
          </div>
        )}
        
        {showBriefing && (
          <div className={styles.text}>
            <Typewriter 
              text={t('briefing.text')}
              speed={30} // Faster for briefing
              onComplete={handleBriefingComplete}
            />
          </div>
        )}
        
        {showButton && (
          <div className={styles.action}>
            <Button 
              onClick={onStart} 
              variant="primary"
              fullWidth
            >
              {t('briefing.beginButton')}
            </Button>
          </div>
        )}
      </div>
      
      <PlayloadFooter />
    </div>
  );
}