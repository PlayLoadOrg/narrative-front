// src/components/Typewriter.jsx
import { useState, useEffect } from 'react';

export function Typewriter({ text, speed = 30, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayedText}</span>;
}

export function TextWithLinks({ text }) {
  if (!text) return null;
  const parts = text.split(/(\[link: .*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /\[link: (.*?)\]\((.*?)\)/.exec(part);
        if (match) {
          return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>;
        }
        return part;
      })}
    </>
  );
}