const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // AirDrop events and methods
  onAirdropFileDetected: (callback) => ipcRenderer.on('airdrop-file-detected', callback),
  showAirdropDialog: (filesInfo) => ipcRenderer.invoke('show-airdrop-dialog', filesInfo),
  readAirdropFile: (filePath) => ipcRenderer.invoke('read-airdrop-file', filePath),
  clearPendingAirdropFiles: () => ipcRenderer.invoke('clear-pending-airdrop-files'),
  
  // Cleanup
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});