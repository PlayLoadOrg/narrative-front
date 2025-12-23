// src/components/game/FilterChat.tsx
import { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { Typewriter } from './Typewriter';
import styles from './FilterChat.module.css';

interface FilterMessage {
  sender: 'filter' | 'system';
  text: string;
  timestamp: number;
}

interface FilterChatProps {
  messages: FilterMessage[];
}

/**
 * Filter Chat Component
 * Simulates a chat interface where Filter's messages appear with typewriter effect
 */
export function FilterChat({ messages }: FilterChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [displayedMessages, setDisplayedMessages] = useState<FilterMessage[]>([]);

  // Add messages one at a time with slight delay
  useEffect(() => {
    if (messages.length === 0) {
      setDisplayedMessages([]);
      return;
    }

    setDisplayedMessages([]); // Reset
    
    messages.forEach((msg, index) => {
      setTimeout(() => {
        setDisplayedMessages(prev => [...prev, msg]);
      }, index * 100); // Stagger message appearance
    });
  }, [messages]);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages]);

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <Shield size={32} className={styles.iconLarge} />
          <p>Awaiting Filter's assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {displayedMessages.map((message, index) => (
          <div 
            key={`${message.timestamp}-${index}`}
            className={`${styles.message} ${message.sender === 'filter' ? styles.filterMessage : styles.systemMessage}`}
          >
            <div className={styles.avatar}>
              <Shield size={20} />
            </div>
            <div className={styles.content}>
              <div className={styles.sender}>
                {message.sender === 'filter' ? 'Filter' : 'System'}
              </div>
              <div className={styles.text}>
                {/* Only typewrite if this is the most recently added message */}
                {index === displayedMessages.length - 1 ? (
                  <Typewriter text={message.text} speed={30} />
                ) : (
                  message.text
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

/**
 * Helper functions to create message objects
 */
export function createFilterMessage(text: string): FilterMessage {
  return {
    sender: 'filter',
    text,
    timestamp: Date.now()
  };
}

export function createSystemMessage(text: string): FilterMessage {
  return {
    sender: 'system',
    text,
    timestamp: Date.now()
  };
}