const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs de forma segura al renderer process
contextBridge.exposeInMainWorld('electron', {
  // Información de la aplicación
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Puedes agregar más APIs aquí según necesites
  platform: process.platform,
  
  // Ejemplo de enviar y recibir mensajes
  send: (channel, data) => {
    // Lista blanca de canales permitidos
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Eliminar el listener anterior si existe
      ipcRenderer.removeAllListeners(channel);
      // Agregar el nuevo listener
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});

// Exponer información del sistema si es necesario
contextBridge.exposeInMainWorld('system', {
  platform: process.platform,
  arch: process.arch
});