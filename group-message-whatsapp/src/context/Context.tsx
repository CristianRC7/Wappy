import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  telefono?: string;
  roleId: number;
  rol: string;
  grupoId?: number;
  grupoNombre?: string;
  grupoDescripcion?: string;
}

interface SessionContextProps {
  isAuthenticated: boolean;
  user: User | null;
  setIsAuthenticated: (auth: boolean) => void;
  setUser: (user: User | null) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <SessionContext.Provider value={{ isAuthenticated, user, setIsAuthenticated, setUser }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de SessionProvider');
  return context;
};
