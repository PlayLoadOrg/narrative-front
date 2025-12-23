// src/components/game/Typewriter.tsx
import { useState, useEffect, useCallback } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

/**
 * Typewriter effect component for Filter's dialogue
 * Click or press any key to skip and complete immediately
 */
export function Typewriter({ text, speed = 30, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < text.length && !isComplete) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  // Skip to end on click or keypress
  const handleSkip = useCallback(() => {
    if (!isComplete) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [isComplete, text, onComplete]);

  // Keyboard support - removed unused 'e' parameter
  useEffect(() => {
    const handleKeyPress = () => {
      if (!isComplete) {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, handleSkip]);

  return (
    <span 
      onClick={handleSkip}
      style={{ cursor: isComplete ? 'default' : 'pointer' }}
      title={isComplete ? '' : 'Click or press any key to skip'}
    >
      {displayedText}
      {!isComplete && <span className="typewriter-cursor">▌</span>}
    </span>
  );
}