import React, { createContext, useContext, useState } from 'react';

interface SessionContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <SessionContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de SessionProvider');
  return context;
};
