/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Definiciones de tipos para las APIs de Electron expuestas
interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;
  platform: NodeJS.Platform;
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
}

interface SystemAPI {
  platform: NodeJS.Platform;
  arch: string;
}

interface Window {
  electron?: ElectronAPI;
  system?: SystemAPI;
}