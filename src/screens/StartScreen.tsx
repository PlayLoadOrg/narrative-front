// src/screens/StartScreen.tsx
import { PlayloadFooter } from '../components/ui/PlayloadFooter';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import narrativeFrontLogo from '../assets/narrativeFront.svg';
import styles from './StartScreen.module.css';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="screen-container">
      <div className={styles.card}>
        <img 
          src={narrativeFrontLogo} 
          alt="Narrative Front Logo" 
          className={styles.logo}
        />
        
        <div className={styles.titleContainer}>
          <h1 className={styles.mainTitle}>{t('start.title')}</h1>
          <p className={styles.brandText}>{t('start.presenter')}</p>
          <p className={styles.creditText}>{t('start.credits')}</p>
        </div>
        
        <div className={styles.disclaimerBox}>
          <p className={styles.disclaimerText}>{t('start.disclaimer')}</p>
        </div>
        
        <Button 
          onClick={onStart} 
          variant="primary"
          fullWidth
        >
          {t('start.affirmButton')}
        </Button>
      </div>
      
      <PlayloadFooter />
    </div>
  );
}