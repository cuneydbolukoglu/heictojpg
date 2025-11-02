const { app, BrowserWindow, TouchBar, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const { TouchBarButton, TouchBarLabel, TouchBarSpacer } = TouchBar;

// electron-is-dev olmadan development modu kontrolü
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp ||
              /[\\/]electron[\\/]/.test(process.execPath);

app.setName('HEIC to JPG Converter');

let mainWindow;
let fileWatcher;

// Touch Bar oluşturma
function createTouchBar() {
  const convertButton = new TouchBarButton({
    label: '🔄 Dönüştür',
    backgroundColor: '#007AFF',
    click: () => {
      if (mainWindow) {
        mainWindow.webContents.send('touchbar-convert');
      }
    }
  });

  const selectFileButton = new TouchBarButton({
    label: '📁 Dosya Seç',
    click: () => {
      if (mainWindow) {
        mainWindow.webContents.send('touchbar-select-file');
      }
    }
  });

  return new TouchBar({
    items: [
      selectFileButton,
      new TouchBarSpacer({ size: 'small' }),
      convertButton,
      new TouchBarSpacer({ size: 'large' }),
      new TouchBarLabel({ label: 'HEIC to JPG' })
    ]
  });
}

// macOS menu template
const template = [
  {
    label: 'HEIC to JPG Converter',
    submenu: [
      { 
        label: 'HEIC to JPG Converter Hakkında',
        click: async () => {
          const { dialog } = require('electron');
          await dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Hakkında',
            message: 'HEIC to JPG Converter',
            detail: 'HEIC dosyalarınızı JPG formatına dönüştürün\nVersiyon 1.0.0'
          });
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Dosya',
    submenu: [
      { 
        label: 'Dosya Aç...',
        accelerator: 'Cmd+O',
        click: async () => {
          const { dialog } = require('electron');
          const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
              { name: 'Images', extensions: ['heic', 'heif'] }
            ]
          });
          if (!result.canceled) {
            mainWindow.webContents.send('file-opened', result.filePaths[0]);
          }
        }
      },
      { type: 'separator' },
      { role: 'close', label: 'Pencereyi Kapat' }
    ]
  },
  {
    label: 'Düzen',
    submenu: [
      { role: 'undo', label: 'Geri Al' },
      { role: 'redo', label: 'İleri Al' },
      { type: 'separator' },
      { role: 'cut', label: 'Kes' },
      { role: 'copy', label: 'Kopyala' },
      { role: 'paste', label: 'Yapıştır' },
      { role: 'selectAll', label: 'Tümünü Seç' }
    ]
  },
  {
    label: 'Görünüm',
    submenu: [
      { role: 'reload', label: 'Yenile' },
      { role: 'forceReload', label: 'Zorla Yenile' },
      { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Gerçek Boyut' },
      { role: 'zoomIn', label: 'Yakınlaştır' },
      { role: 'zoomOut', label: 'Uzaklaştır' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Tam Ekran' }
    ]
  },
  {
    label: 'Pencere',
    submenu: [
      { role: 'minimize', label: 'Küçült' },
      { role: 'close', label: 'Kapat' },
      { type: 'separator' },
      { role: 'front', label: 'Öne Getir' }
    ]
  }
];

function createWindow() {
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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    // titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#1a1a1a'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Touch Bar'ı burada ayarla - BURASI ÖNEMLİ!
    if (process.platform === 'darwin') {
      mainWindow.setTouchBar(createTouchBar());
    }
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // URL yükleme
  if (isDev) {
    console.log('🛠️ Development mode: Loading from Next.js dev server...');
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      console.log('Port 3000 failed, trying 3001...');
      mainWindow.loadURL('http://localhost:3001').catch(err => {
        console.log('Port 3001 failed, showing error page...');
        showErrorPage('Development server not found. Please run: npm run dev');
      });
    });
  } else {
    console.log('🚀 Production mode: Loading from build...');
    const buildPath = path.join(__dirname, '../../out');
    
    if (fs.existsSync(buildPath)) {
      const indexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath).catch(err => {
          console.error('Failed to load from out directory:', err);
          showErrorPage('Failed to load build files');
        });
      } else {
        showErrorPage('index.html not found in build directory');
      }
    } else {
      console.log('No build found, trying development server...');
      mainWindow.loadURL('http://localhost:3000').catch(err => {
        showErrorPage('No build found. Please run: npm run build');
      });
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ... (diğer fonksiyonlar aynı: showErrorPage, watchAirDropFiles, IPC handlers)

// App event handlers
app.whenReady().then(() => {
  console.log('🚀 Electron app starting...');
  
  // Menu'yu BURADA oluştur ve ayarla
  if (process.platform === 'darwin') {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
  
  createWindow();
  watchAirDropFiles();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});