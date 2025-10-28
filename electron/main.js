const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

// electron-is-dev olmadan development modu kontrolü
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp ||
              /[\\/]electron[\\/]/.test(process.execPath);

app.setName('HEIC to JPG Converter');

let mainWindow;
let fileWatcher;

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
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#1a1a1a'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
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

function showErrorPage(message) {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>HEIC to JPG Converter</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 500px;
          }
          h1 { margin-bottom: 20px; }
          .error-message {
            background: rgba(255,0,0,0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid rgba(255,0,0,0.3);
          }
          code {
            background: rgba(0,0,0,0.3);
            padding: 10px;
            border-radius: 5px;
            display: block;
            margin: 10px 0;
            font-family: 'Monaco', 'Menlo', monospace;
          }
          button {
            background: #1890ff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            margin: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>HEIC to JPG Converter</h1>
          <div class="error-message">
            <strong>Error:</strong> ${message}
          </div>
          <p>Çözüm için:</p>
          <code>npm run dev</code>
          <p>veya</p>
          <code>npm run build</code>
          <div style="margin-top: 20px;">
            <button onclick="location.reload()">Tekrar Dene</button>
          </div>
        </div>
      </body>
    </html>
  `;
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
}

// AirDrop dosya izleme
function watchAirDropFiles() {
  const downloadsPath = path.join(process.env.HOME, 'Downloads');
  
  if (!fs.existsSync(downloadsPath)) {
    console.log('Downloads directory not found');
    return;
  }
  
  console.log('📁 Watching files in:', downloadsPath);
  
  fileWatcher = chokidar.watch(downloadsPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  fileWatcher.on('add', (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.heic', '.heif'].includes(ext)) {
      console.log('📸 HEIC file detected:', filePath);
      
      try {
        const stats = fs.statSync(filePath);
        const fileData = {
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          type: 'airdrop'
        };
        
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('airdrop-file', fileData);
        }
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  });
}

// IPC Handlers
ipcMain.handle('convert-file', async (event, filePath) => {
  try {
    console.log('Converting file:', filePath);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-to-photos', async (event, filePath) => {
  try {
    const picturesPath = path.join(process.env.HOME, 'Pictures');
    const importPath = path.join(picturesPath, 'Converted Images', path.basename(filePath));
    
    const dir = path.dirname(importPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, importPath);
    return { success: true, path: importPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return { success: true, buffer: buffer };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  console.log('🚀 Electron app starting...');
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

// macOS menu
if (process.platform === 'darwin') {
  const template = [
    {
      label: 'HEIC to JPG Converter',
      submenu: [
        { role: 'about' },
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
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}