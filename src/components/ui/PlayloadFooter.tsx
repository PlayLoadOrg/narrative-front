// src/components/ui/PlayloadFooter.tsx
import styles from './PlayloadFooter.module.css';

export function PlayloadFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <a
          href="https://playloadorg.github.io/landing-main-1/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          POWERED BY PLAYLOAD.ORG
        </a>
      </div>
    </footer>
  );
}