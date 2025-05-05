import React, { createContext, useContext, useState } from 'react';

interface SendResult {
  telefono: string;
  status: 'enviado' | 'error';
}

interface NotificationState {
  current: string | null;
  total: number;
  index: number;
  sending: boolean;
  results: SendResult[];
  finished: boolean;
}

interface NotificationContextProps extends NotificationState {
  start: (total: number) => void;
  update: (current: string, index: number) => void;
  addResult: (telefono: string, status: 'enviado' | 'error') => void;
  finish: () => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({ current: null, total: 0, index: 0, sending: false, results: [], finished: false });

  const start = (total: number) => setState({ current: null, total, index: 0, sending: true, results: [], finished: false });
  const update = (current: string, index: number) => setState(s => ({ ...s, current, index }));
  const addResult = (telefono: string, status: 'enviado' | 'error') => setState(s => ({ ...s, results: [...s.results, { telefono, status }] }));
  const finish = () => setState(s => ({ ...s, sending: false, finished: true, current: null }));
  const clear = () => setState({ current: null, total: 0, index: 0, sending: false, results: [], finished: false });

  return (
    <NotificationContext.Provider value={{ ...state, start, update, addResult, finish, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de NotificationProvider');
  return ctx;
}; 