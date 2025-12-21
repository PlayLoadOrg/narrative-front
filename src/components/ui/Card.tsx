// src/components/ui/Card.tsx
import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  isBlurred?: boolean;
}

export function Card({ children, className, isBlurred }: CardProps) {
  return (
    <div 
      className={clsx(
        styles.card, 
        isBlurred && styles.blurred,
        className
      )}
    >
      {children}
    </div>
  );
}