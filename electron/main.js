const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp ||
              /[\\/]electron[\\/]/.test(process.execPath);

app.setName('HEIC to JPG Converter');

let mainWindow;
let fileWatcher;
let pendingAirdropFiles = [];

function createMenuTemplate() {
  return [
    {
      label: 'HEIC to JPG Converter',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    }
  ];
}

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    backgroundColor: '#ffffff'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      showErrorPage('Development server not found. Please run: npm run dev');
    });
  } else {
    const buildPath = path.join(__dirname, '../out');
    const indexPath = path.join(buildPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath).catch(err => {
        showErrorPage('Failed to load application');
      });
    } else {
      showErrorPage('Application build not found');
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showErrorPage(message) {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>Error</title></head>
      <body>
        <div style="padding: 40px; text-align: center;">
          <h1>HEIC to JPG Converter</h1>
          <div style="color: red; margin: 20px 0;">${message}</div>
        </div>
      </body>
    </html>
  `;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  }
}

// AirDrop dosya izleme - GELİŞTİRİLMİŞ VERSİYON
function watchAirDropFiles() {
  const downloadsPath = path.join(process.env.HOME, 'Downloads');
  
  if (!fs.existsSync(downloadsPath)) {
    console.log('Downloads directory not found');
    return;
  }

  console.log('🔍 Watching for AirDrop files in:', downloadsPath);
  
  fileWatcher = chokidar.watch(downloadsPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    depth: 1
  });

  fileWatcher.on('add', (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.heic', '.heif'].includes(ext)) {
      console.log('📸 HEIC file detected via AirDrop:', filePath);
      
      try {
        const stats = fs.statSync(filePath);
        // Sadece çok yeni dosyaları işle (son 10 saniye)
        const fileAge = Date.now() - stats.mtimeMs;
        
        if (fileAge < 10000) { // 10 saniyeden yeni dosyalar
          const fileInfo = {
            path: filePath,
            name: path.basename(filePath),
            size: stats.size,
            addedTime: Date.now()
          };

          pendingAirdropFiles.push(fileInfo);
          
          // Renderer process'e bildir
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('airdrop-file-detected', {
              file: fileInfo,
              totalPending: pendingAirdropFiles.length
            });
          }
        }
      } catch (error) {
        console.error('Error reading AirDrop file:', error);
      }
    }
  });
}

// IPC Handlers - GELİŞTİRİLMİŞ
ipcMain.handle('show-airdrop-dialog', async (event, filesInfo) => {
  if (!mainWindow) return { confirmed: false };
  
  const fileCount = filesInfo.files.length;
  const fileNames = filesInfo.files.map(f => f.name).join('\n• ');
  
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'AirDrop Files Detected',
    message: fileCount === 1 
      ? `Do you want to convert "${filesInfo.files[0].name}"?`
      : `Do you want to convert ${fileCount} files from AirDrop?`,
    detail: fileCount > 1 
      ? `Files:\n• ${fileNames}`
      : 'This file was received via AirDrop and can be converted to JPG.',
    buttons: ['Convert All', 'Cancel'],
    defaultId: 0,
    cancelId: 1
  });
  
  return { confirmed: result.response === 0 };
});

ipcMain.handle('read-airdrop-file', async (event, filePath) => {
  try {
    console.log('📖 Reading AirDrop file:', filePath);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File does not exist' };
    }
    
    // Dosya istatistiklerini al
    const stats = fs.statSync(filePath);
    console.log('📊 File stats:', {
      size: stats.size,
      modified: stats.mtime
    });
    
    // Dosyayı buffer olarak oku
    const buffer = fs.readFileSync(filePath);
    
    // Buffer'ın geçerli olup olmadığını kontrol et
    if (!buffer || buffer.length === 0) {
      return { success: false, error: 'File is empty or corrupted' };
    }
    
    console.log('✅ Successfully read file, buffer size:', buffer.length);
    return { success: true, buffer: buffer };
    
  } catch (error) {
    console.error('❌ Error reading AirDrop file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-pending-airdrop-files', async (event) => {
  pendingAirdropFiles = [];
});

// App event handlers
app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(createMenuTemplate());
  Menu.setApplicationMenu(menu);
  
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