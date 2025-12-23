// src/components/ui/StickyHeader.tsx
import { useState } from 'react';
import { Menu, X, Volume2, VolumeX, Save, Upload, Home, Book, Shield } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import narrativeFrontLogo from '../../assets/narrativeFront.svg';
import styles from './StickyHeader.module.css';

interface StickyHeaderProps {
  onSaveGame?: () => void;
  onLoadGame?: () => void;
  onReturnToMenu?: () => void;
  onOpenFrontopedia?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  showSettings?: boolean;
}

export function StickyHeader({
  onSaveGame,
  onLoadGame,
  onReturnToMenu,
  onOpenFrontopedia,
  isMuted,
  onToggleMute,
  showSettings = false
}: StickyHeaderProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAction = (action?: () => void) => {
    if (action) action();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {showSettings && (
            <button
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t('accessibility.menuButton')}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          <div className={styles.brand}>
            <Shield className={styles.brandIcon} size={20} />
            <span className={styles.brandText}>NARRATIVE FRONT</span>
            <img 
              src={narrativeFrontLogo} 
              alt="Narrative Front" 
              className={styles.brandLogo}
            />
          </div>
        </div>
      </header>

      {/* Settings Menu Dropdown */}
      {isMenuOpen && showSettings && (
        <>
          <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />
          <div className={styles.menu}>
            <h3 className={styles.menuTitle}>{t('settings.title')}</h3>

            <div className={styles.menuItems}>
              {onToggleMute && (
                <button
                  className={styles.menuItem}
                  onClick={() => handleAction(onToggleMute)}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  <span>{isMuted ? t('settings.unmuteButton') : t('settings.muteButton')}</span>
                </button>
              )}

              {onSaveGame && (
                <button
                  className={styles.menuItem}
                  onClick={() => handleAction(onSaveGame)}
                >
                  <Save size={20} />
                  <span>{t('settings.saveGameButton')}</span>
                </button>
              )}

              {onLoadGame && (
                <button
                  className={styles.menuItem}
                  onClick={() => handleAction(onLoadGame)}
                >
                  <Upload size={20} />
                  <span>{t('settings.loadGameButton')}</span>
                </button>
              )}

              {onOpenFrontopedia && (
                <button
                  className={styles.menuItem}
                  onClick={() => handleAction(onOpenFrontopedia)}
                >
                  <Book size={20} />
                  <span>Frontopedia</span>
                </button>
              )}

              {onReturnToMenu && (
                <button
                  className={styles.menuItem}
                  onClick={() => handleAction(onReturnToMenu)}
                >
                  <Home size={20} />
                  <span>Return to Main Menu</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}