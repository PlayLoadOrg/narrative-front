// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'default', 
  fullWidth = false, 
  className, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.button,
        variant === 'primary' && styles.primary,
        fullWidth && styles.fullWidth,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}