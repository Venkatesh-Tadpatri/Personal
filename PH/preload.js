const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform:  process.platform,
  // Called from React to print an HTML string via Electron
  printHTML: (html) => ipcRenderer.send('print-html', html),
});