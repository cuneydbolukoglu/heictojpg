const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let fileWatcher;

// AirDrop dosyalarını izle
function watchAirDropFiles() {
  const airDropPath = path.join(process.env.HOME, 'Downloads');
  
  console.log('Watching AirDrop files in:', airDropPath);
  
  fileWatcher = chokidar.watch(airDropPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
  });

  fileWatcher.on('add', (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.heic', '.heif'].includes(ext)) {
      console.log('HEIC file detected:', filePath);
      
      // Web sayfasına dosya bilgisini gönder
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('airdrop-file', {
          path: filePath,
          name: path.basename(filePath),
          size: fs.statSync(filePath).size
        });
      }
    }
  });
}

// IPC handlers
ipcMain.handle('convert-file', async (event, filePath) => {
  try {
    // Burada dosyayı dönüştürme işlemi yapılabilir
    // Şimdilik sadece dosya yolunu döndürüyoruz
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

let mainWindow;

function createWindow() {
  // Ana pencereyi oluştur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    icon: path.join(__dirname, 'public/icon.png'), // Uygulama ikonu
    titleBarStyle: 'hiddenInset', // Mac için native görünüm
    show: false, // Pencere hazır olana kadar gizle
    backgroundColor: '#0f1923' // Dark theme background
  });

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Development modunda DevTools'u aç
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Next.js uygulamasını yükle
  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, 'out/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // External linkleri default browser'da aç
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();
  
  // AirDrop dosyalarını izlemeye başla
  watchAirDropFiles();

  // Mac'te dock icon'a tıklandığında pencereyi göster
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamayı kapat (Mac hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Mac menüsünü oluştur
if (process.platform === 'darwin') {
  const template = [
    {
      label: 'HEIC2JPG',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

