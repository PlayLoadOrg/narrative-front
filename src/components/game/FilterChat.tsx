// src/components/game/FilterChat.tsx
import { MessageSquare } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './FilterChat.module.css';

interface FilterMessage {
  id: string;
  sender: 'filter';
  text: string;
}

interface FilterChatProps {
  messages: FilterMessage[];
}

export function FilterChat({ messages }: FilterChatProps) {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <MessageSquare className={styles.emptyIcon} size={48} />
        <p className={styles.emptyText}>{t('filter.emptyState')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((message) => (
          <div key={message.id} className={styles.message}>
            <div className={styles.avatar}>
              <MessageSquare size={16} />
            </div>
            <div className={styles.content}>
              <div className={styles.sender}>FILTER</div>
              <div className={styles.text}>{message.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to create filter messages
export function createFilterMessage(text: string): FilterMessage {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    sender: 'filter',
    text
  };
}