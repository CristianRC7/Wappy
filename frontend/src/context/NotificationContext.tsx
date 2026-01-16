/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

interface SendResult {
  telefono?: string;
  grupo?: string;
  status: 'enviado' | 'error';
}

interface NotificationState {
  current: string | null;
  total: number;
  index: number;
  sending: boolean;
  results: SendResult[];
  finished: boolean;
  type: 'mensaje' | 'grupo' | null;
  loading: boolean;
  createdGroups: { grupo: string; link: string }[];
}

interface NotificationContextProps extends NotificationState {
  start: (total: number, type: 'mensaje' | 'grupo') => void;
  update: (current: string, index: number) => void;
  addResult: (data: { telefono?: string; grupo?: string; status: 'enviado' | 'error' }) => void;
  finish: () => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setCreatedGroups: (groups: { grupo: string; link: string }[]) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({ 
    current: null, 
    total: 0, 
    index: 0, 
    sending: false, 
    results: [], 
    finished: false, 
    type: null, 
    loading: false, 
    createdGroups: [] 
  });

  const start = (total: number, type: 'mensaje' | 'grupo') => setState(s => ({ ...s, current: null, total, index: 0, sending: true, results: [], finished: false, type, loading: true }));
  const update = (current: string, index: number) => setState(s => ({ ...s, current, index }));
  const addResult = (data: { telefono?: string; grupo?: string; status: 'enviado' | 'error' }) => setState(s => ({ ...s, results: [...s.results, data] }));
  const finish = () => setState(s => ({ ...s, sending: false, finished: true, current: null, loading: false }));
  const clear = () => setState(s => ({ ...s, current: null, total: 0, index: 0, sending: false, results: [], finished: false, type: null, loading: false }));
  const setLoading = (loading: boolean) => setState(s => ({ ...s, loading }));
  const setCreatedGroups = (groups: { grupo: string; link: string }[]) => setState(s => ({ ...s, createdGroups: groups }));

  return (
    <NotificationContext.Provider value={{ ...state, start, update, addResult, finish, clear, setLoading, setCreatedGroups }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de NotificationProvider');
  return ctx;
};