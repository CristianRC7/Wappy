const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  // Determinar ruta del icono según el modo
  let iconPath;
  if (app.isPackaged) {
    // Producción: buscar en varias ubicaciones posibles
    const possiblePaths = [
      path.join(process.resourcesPath, 'icon.png'),
      path.join(process.resourcesPath, 'build', 'icon.png'),
      path.join(process.resourcesPath, 'app', 'build', 'icon.png'),
      path.join(__dirname, '../build/icon.png')
    ];
    
    iconPath = possiblePaths.find(p => fs.existsSync(p));
    
    if (iconPath) {
      console.log('✓ Icono encontrado en:', iconPath);
    } else {
      console.log('⚠ Icono no encontrado, usando icono por defecto');
      iconPath = null;
    }
  } else {
    // Desarrollo: usar ruta desde src/assets
    iconPath = path.join(__dirname, '../src/assets/icon.png');
    if (!fs.existsSync(iconPath)) {
      console.log('⚠ Icono no encontrado en desarrollo:', iconPath);
      iconPath = null;
    }
  }

  const windowOptions = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    title: 'Wappy',
    autoHideMenuBar: false
  };

  // Solo agregar icono si existe
  if (iconPath) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);

  // Menu horizontal directo - solo Recargar y Salir
  const menuTemplate = [
    { label: 'Recargar', click: () => { mainWindow.reload(); } },
    { label: 'Salir', click: () => { app.quit(); } }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Determinar si estamos en desarrollo o producción
  const isDev = !app.isPackaged;

  if (isDev) {
    // Desarrollo: cargar desde servidor Vite
    console.log('Modo desarrollo: cargando desde http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Descomentar para debug
  } else {
    // Producción: cargar desde archivos locales
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Modo producción: cargando desde', indexPath);
    
    // Verificar que el archivo exists
    if (fs.existsSync(indexPath)) {
      console.log('✓ Archivo index.html encontrado');
      mainWindow.loadFile(indexPath);
    } else {
      console.error('✗ ERROR: No se encontró index.html en', indexPath);
      // Intentar ruta alternativa
      const altPath = path.join(process.resourcesPath, 'dist/index.html');
      console.log('Intentando ruta alternativa:', altPath);
      if (fs.existsSync(altPath)) {
        console.log('✓ Archivo encontrado en ruta alternativa');
        mainWindow.loadFile(altPath);
      } else {
        console.error('✗ ERROR: Tampoco se encontró en ruta alternativa');
      }
    }

    // Abrir DevTools en producción para debug (comentar después)
    // mainWindow.webContents.openDevTools();
  }

  // Log de errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar:', errorCode, errorDescription);
  });

  // Log cuando termine de cargar
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✓ Contenido cargado exitosamente');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  console.log('App Path:', app.getAppPath());
  console.log('Resources Path:', process.resourcesPath);
  console.log('Is Packaged:', app.isPackaged);
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});
