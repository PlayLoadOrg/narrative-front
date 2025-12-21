// src/components/game/ManpowerDisplay.tsx
import { Users } from 'lucide-react';
import clsx from 'clsx';
import styles from './ManpowerDisplay.module.css';

interface ManpowerDisplayProps {
  amount: number;
}

export function ManpowerDisplay({ amount }: ManpowerDisplayProps) {
  return (
    <div className={styles.container}>
      <Users className={styles.icon} />
      <span className={styles.label}>Manpower</span>
      <span className={clsx(styles.value, amount < 5 && styles.low)}>
        {amount}
      </span>
    </div>
  );
}