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
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button as soon as text is visible
    const timer = setTimeout(() => setShowButton(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="screen-container">
      <div className={styles.card}>
        <div className={styles.quote}>
          {t('briefing.quote')}
        </div>
        
        <div className={styles.attribution}>
          {t('briefing.attribution')}
        </div>
        
        <div className={styles.text}>
          {t('briefing.text')}
        </div>
        
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