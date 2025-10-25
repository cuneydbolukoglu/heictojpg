const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const isDev = process.env.NODE_ENV === 'development';

app.setName('heictojpg Converter');

let mainWindow;
let fileWatcher;

// AirDrop dosyalarını izle
function watchAirDropFiles() {
  const airDropPath = path.join(process.env.HOME, 'Downloads');
  
  console.log('Watching AirDrop files in:', airDropPath);
  
  fileWatcher = chokidar.watch(airDropPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  fileWatcher.on('add', async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.heic', '.heif'].includes(ext)) {
      console.log('HEIC file detected via AirDrop:', filePath);
      
      try {
        const stats = fs.statSync(filePath);
        const fileData = {
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          type: 'airdrop'
        };
        
        // Web sayfasına dosya bilgisini gönder
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('airdrop-file', fileData);
        }
      } catch (error) {
        console.error('Error reading AirDrop file:', error);
      }
    }
  });
}

// IPC handlers
ipcMain.handle('convert-file', async (event, filePath) => {
  try {
    console.log(`Converting file: ${filePath}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, path: filePath, output: 'output/path/simulated.jpg' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Yeni: Dosyayı Photos.js'e aktar
ipcMain.handle('import-to-photos', async (event, filePath) => {
  try {
    // Burada dosyayı Photos uygulamasına aktarma işlemi yapılacak
    console.log(`Importing to Photos: ${filePath}`);
    
    // Şimdilik dosyayı kopyalayarak simüle edelim
    const photosImportPath = path.join(process.env.HOME, 'Pictures', 'Imported Photos', path.basename(filePath));
    
    // Klasörü oluştur
    const dir = path.dirname(photosImportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Dosyayı kopyala
    fs.copyFileSync(filePath, photosImportPath);
    
    return { success: true, importedPath: photosImportPath };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
});

// Yeni: Dosya okuma handler'ı
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return { success: true, buffer: buffer };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

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
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#0f1923'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, 'out/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  watchAirDropFiles();

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

if (process.platform === 'darwin') {
  const template = [
    {
      label: 'heictojpg Converter',
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