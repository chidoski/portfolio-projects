import { useState, useCallback } from 'react';

interface AuditEntry {
  ts: string;
  user: string;
  role: string;
  messageId: string;
  event: string;
}

interface PushParams {
  user: string;
  role: string;
  messageId: string;
  event: string;
}

export function useAudit() {
  const [entries, setEntries] = useState<Array<AuditEntry>>([]);

  const readFromStorage = useCallback((messageId: string): Array<AuditEntry> => {
    try {
      const storageKey = `audit_${messageId}`;
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading audit entries from storage:', error);
      return [];
    }
  }, []);

  const push = useCallback(({ user, role, messageId, event }: PushParams): void => {
    const ts = new Date().toISOString();
    const newEntry = { ts, user, role, messageId, event };
    
    // Update state
    setEntries(prev => [newEntry, ...prev]);
    
    // Mirror to sessionStorage
    const storageKey = `audit_${messageId}`;
    const existingEntries = readFromStorage(messageId);
    const updatedEntries = [newEntry, ...existingEntries];
    sessionStorage.setItem(storageKey, JSON.stringify(updatedEntries));
  }, [readFromStorage]);

  const clear = useCallback((messageId: string): void => {
    const storageKey = `audit_${messageId}`;
    sessionStorage.removeItem(storageKey);
    setEntries([]);
  }, []);

  return {
    entries,
    push,
    readFromStorage,
    clear
  };
}
