/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useRef } from 'react';

interface SendResult {
  telefono?: string;
  grupo?: string;
  status: 'enviado' | 'error';
}

export interface AddedResult {
  telefono: string;
  status: 'agregado' | 'error';
  reason: string;
  makeAdmin: boolean;
  adminStatus: 'promovido' | 'error_al_promover' | 'no_agregado' | null;
}

interface NotificationState {
  current: string | null;
  total: number;
  index: number;
  sending: boolean;
  results: SendResult[];
  finished: boolean;
  type: 'mensaje' | 'grupo' | 'agregar' | null;
  loading: boolean;
  createdGroups: Array<Record<string, string>>;
  addedResults: AddedResult[];
  cancelled: boolean;
}

interface NotificationContextProps extends NotificationState {
  start: (total: number, type: 'mensaje' | 'grupo' | 'agregar') => void;
  update: (current: string, index: number) => void;
  addResult: (data: { telefono?: string; grupo?: string; status: 'enviado' | 'error' }) => void;
  finish: () => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setCreatedGroups: (groups: Array<Record<string, string>>) => void;
  setAddedResults: (results: AddedResult[]) => void;
  cancel: () => void;
  getCancelRef: () => React.MutableRefObject<boolean>;
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
    createdGroups: [],
    addedResults: [],
    cancelled: false,
  });

  const cancelledRef = useRef(false);

  const start = (total: number, type: 'mensaje' | 'grupo' | 'agregar') => {
    cancelledRef.current = false;
    setState(s => ({
      ...s,
      current: null,
      total,
      index: 0,
      sending: true,
      results: [],
      finished: false,
      type,
      loading: true,
      createdGroups: [],
      addedResults: [],
      cancelled: false,
    }));
  };

  const update = (current: string, index: number) =>
    setState(s => ({ ...s, current, index }));

  const addResult = (data: { telefono?: string; grupo?: string; status: 'enviado' | 'error' }) =>
    setState(s => ({ ...s, results: [...s.results, data] }));

  const finish = () => {
    cancelledRef.current = false;
    setState(s => ({ ...s, sending: false, finished: true, current: null, loading: false, cancelled: false }));
  };

  const clear = () => {
    cancelledRef.current = false;
    setState(s => ({
      ...s,
      current: null,
      total: 0,
      index: 0,
      sending: false,
      results: [],
      finished: false,
      type: null,
      loading: false,
      createdGroups: [],
      addedResults: [],
      cancelled: false,
    }));
  };

  const setLoading = (loading: boolean) => setState(s => ({ ...s, loading }));

  const setCreatedGroups = (groups: Array<Record<string, string>>) =>
    setState(s => ({ ...s, createdGroups: groups }));

  const setAddedResults = (results: AddedResult[]) =>
    setState(s => ({ ...s, addedResults: results }));

  const cancel = () => {
    console.log('🛑 Cancelando proceso...');
    cancelledRef.current = true;
    setState(s => ({ ...s, cancelled: true }));
  };

  const getCancelRef = () => cancelledRef;

  return (
    <NotificationContext.Provider value={{
      ...state,
      start,
      update,
      addResult,
      finish,
      clear,
      setLoading,
      setCreatedGroups,
      setAddedResults,
      cancel,
      getCancelRef,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de NotificationProvider');
  return ctx;
};