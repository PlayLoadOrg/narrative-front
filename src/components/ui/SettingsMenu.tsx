// src/components/ui/SettingsMenu.tsx
import { useState } from 'react';
import { Menu, Volume2, VolumeX, Save, Upload, Home, Book, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './SettingsMenu.module.css';

interface SettingsMenuProps {
  onSaveGame: () => void;
  onLoadGame: () => void;
  onReturnToMenu: () => void;
  onOpenFrontopedia: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function SettingsMenu({
  onSaveGame,
  onLoadGame,
  onReturnToMenu,
  onOpenFrontopedia,
  isMuted,
  onToggleMute
}: SettingsMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.hamburger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('accessibility.menuButton')}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.menu}>
            <h3 className={styles.title}>{t('settings.title')}</h3>

            <div className={styles.menuItems}>
              <button
                className={styles.menuItem}
                onClick={() => handleAction(onToggleMute)}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <span>{isMuted ? t('settings.unmuteButton') : t('settings.muteButton')}</span>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleAction(onSaveGame)}
              >
                <Save size={20} />
                <span>{t('settings.saveGameButton')}</span>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleAction(onLoadGame)}
              >
                <Upload size={20} />
                <span>{t('settings.loadGameButton')}</span>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleAction(onOpenFrontopedia)}
              >
                <Book size={20} />
                <span>Frontopedia</span>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleAction(onReturnToMenu)}
              >
                <Home size={20} />
                <span>Return to Main Menu</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}