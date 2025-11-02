const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  convertFile: (filePath) => ipcRenderer.invoke('convert-file', filePath),
  importToPhotos: (filePath) => ipcRenderer.invoke('import-to-photos', filePath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // Events
  onAirdropFile: (callback) => ipcRenderer.on('airdrop-file', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  
  // Touch Bar events
  onTouchBarConvert: (callback) => ipcRenderer.on('touchbar-convert', callback),
  onTouchBarSelectFile: (callback) => ipcRenderer.on('touchbar-select-file', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});