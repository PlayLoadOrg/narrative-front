// src/screens/BriefingScreen.tsx
import { useState, useEffect } from 'react';
import { PlayloadFooter } from '../components/ui/PlayloadFooter';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import styles from './BriefingScreen.module.css';

interface BriefingScreenProps {
  onStart: () => void;
}

export function BriefingScreen({ onStart }: BriefingScreenProps) {
  const { t } = useTranslation();
  const [quoteComplete, setQuoteComplete] = useState(false);
  const [textComplete, setTextComplete] = useState(false);

  // Simple typewriter effect simulation
  useEffect(() => {
    const quoteTimer = setTimeout(() => setQuoteComplete(true), 1500);
    return () => clearTimeout(quoteTimer);
  }, []);

  useEffect(() => {
    if (quoteComplete) {
      const textTimer = setTimeout(() => setTextComplete(true), 2500);
      return () => clearTimeout(textTimer);
    }
  }, [quoteComplete]);

  return (
    <div className="screen-container">
      <div className={styles.card}>
        <div className={styles.quote}>
          {t('briefing.quote')}
        </div>
        
        {quoteComplete && (
          <div className={styles.attribution}>
            {t('briefing.attribution')}
          </div>
        )}
        
        {quoteComplete && (
          <div className={styles.text}>
            {t('briefing.text')}
          </div>
        )}
        
        {textComplete && (
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