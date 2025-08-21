import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionData {
  userEmail: string;
  isEnrolled: boolean;
  role: "Viewer" | "AP_Manager" | "Controller" | "CFO";
  restrictedView: boolean;
}

interface SessionContextType {
  session: SessionData | null;
  setSession: (session: SessionData | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionData | null>(null);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
