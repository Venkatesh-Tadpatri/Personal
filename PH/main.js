// const { app, BrowserWindow, shell } = require('electron');
// const path = require('path');
// const { spawn } = require('child_process');

// let mainWindow;
// let serverProcess;

// const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// function startServer() {
//   const serverPath = path.join(__dirname, 'server.js');
//   serverProcess = spawn(process.execPath, [serverPath], {
//     env: { ...process.env, NODE_ENV: 'production' },
//     stdio: 'inherit'
//   });

//   serverProcess.on('error', (err) => {
//     console.error('Server error:', err);
//   });
// }

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     minWidth: 1100,
//     minHeight: 700,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true
//     },
//     titleBarStyle: 'default',
//     icon: path.join(__dirname, 'assets', 'icon.ico'),
//     show: false,
//     backgroundColor: '#0f172a'
//   });

//   // if (isDev) {
//   //   mainWindow.loadURL('http://localhost:3000');
//   //   mainWindow.webContents.openDevTools();
//   // } else {
//   //   // mainWindow.loadFile(path.join(__dirname, 'client', 'build', 'index.html'));
//   //   mainWindow.loadFile(path.join(__dirname, '../client/build/index.html'));
//   // }

//   const startUrl = isDev
//   ? 'http://localhost:3000'
//   : `file://${path.join(__dirname, './client/build/index.html')}`;

// mainWindow.loadURL(startUrl);

// if (isDev) {
//   mainWindow.webContents.openDevTools();
// }

//   mainWindow.once('ready-to-show', () => {
//     mainWindow.show();
//     mainWindow.maximize();
//   });

//   mainWindow.webContents.setWindowOpenHandler(({ url }) => {
//     shell.openExternal(url);
//     return { action: 'deny' };
//   });

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// app.whenReady().then(() => {
//   if (!isDev) {
//     startServer();
//     setTimeout(createWindow, 1500);
//   } else {
//     createWindow();
//   }
// });

// app.on('window-all-closed', () => {
//   if (serverProcess) serverProcess.kill();
//   if (process.platform !== 'darwin') app.quit();
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });


// const { app, BrowserWindow, shell, ipcMain } = require('electron');
// const path = require('path');
// const { spawn } = require('child_process');

// let mainWindow;
// let serverProcess;

// const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// function startServer() {
//   const serverPath = path.join(__dirname, 'server.js');
//   serverProcess = spawn(process.execPath, [serverPath], {
//     env: { ...process.env, NODE_ENV: 'production' },
//     stdio: 'inherit'
//   });
//   serverProcess.on('error', (err) => {
//     console.error('Server error:', err);
//   });
// }

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     minWidth: 1100,
//     minHeight: 700,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//     titleBarStyle: 'default',
//     icon: path.join(__dirname, 'assets', 'icon.ico'),
//     show: false,
//     backgroundColor: '#0f172a'
//   });

//   if (isDev) {
//     mainWindow.loadURL('http://localhost:3000');
//     // mainWindow.webContents.openDevTools();
//   } else {
//     mainWindow.loadFile(path.join(__dirname, 'client', 'build', 'index.html'));
//   }

//   mainWindow.once('ready-to-show', () => {
//     mainWindow.show();
//     mainWindow.maximize();
//   });

//   // Block external URL popups — printing handled via IPC
//   mainWindow.webContents.setWindowOpenHandler(({ url }) => {
//     if (url && url.startsWith('http')) {
//       shell.openExternal(url);
//     }
//     return { action: 'deny' };
//   });

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// // ── IPC: Print HTML ──────────────────────────────────────────
// // Opens a visible BrowserWindow with the HTML content.
// // The HTML itself has window.onload = window.print() so the
// // Chrome print dialog (with preview) opens automatically.
// ipcMain.on('print-html', (event, html) => {
//   const os   = require('os');
//   const fs2  = require('fs');

//   // Write HTML to a temp file with UTF-8 BOM to preserve special chars (₹, −, etc.)
//   const tmpFile = path.join(os.tmpdir(), 'ph_print_' + Date.now() + '.html');
//   // Add UTF-8 BOM + charset meta to ensure correct rendering
//   const safeHtml = html.replace('<head>', '<head><meta charset=UTF-8>');
//   fs2.writeFileSync(tmpFile, safeHtml, 'utf8');

//   const printWin = new BrowserWindow({
//     width:  950,
//     height: 900,
//     show:   true,
//     autoHideMenuBar: true,
//     title:  'Bill Preview',
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//   });

//   printWin.setMenuBarVisibility(false);

//   // Load from file:// — preserves UTF-8 encoding perfectly
//   printWin.loadFile(tmpFile);

//   // Clean up temp file after window closes
//   printWin.on('closed', () => {
//     try { fs2.unlinkSync(tmpFile); } catch(e) {}
//   });
// });

// app.whenReady().then(() => {
//   if (!isDev) {
//     startServer();
//     setTimeout(createWindow, 1500);
//   } else {
//     createWindow();
//   }
// });

// app.on('window-all-closed', () => {
//   if (serverProcess) serverProcess.kill();
//   if (process.platform !== 'darwin') app.quit();
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });




// const { app, BrowserWindow, shell, ipcMain } = require('electron');
// const path = require('path');
// const { spawn } = require('child_process');

// // ── Single instance lock — prevents multiple windows opening ──
// const gotLock = app.requestSingleInstanceLock();
// if (!gotLock) {
//   // Another instance is already running — quit this one
//   app.quit();
//   process.exit(0);
// }

// let mainWindow = null;
// let serverProcess = null;

// const isDev = !app.isPackaged;

// // ── Set app name ──────────────────────────────────────────────
// app.setName('PH AgriTrader');

// function startServer() {
//   // In packaged app, files are inside app.asar - use process.resourcesPath
//   const serverPath = app.isPackaged
//     ? path.join(process.resourcesPath, 'app.asar', 'server.js')
//     : path.join(__dirname, 'server.js');

//   console.log('[server] starting from:', serverPath);
//   console.log('[server] node:', process.execPath);

//   serverProcess = spawn(process.execPath, [serverPath], {
//     env: {
//       ...process.env,
//       NODE_ENV: 'production',
//       // Point to resources folder for native modules
//       ELECTRON_RUN_AS_NODE: '1',
//     },
//     stdio: 'pipe',
//   });

//   serverProcess.stdout && serverProcess.stdout.on('data', d => console.log('[server]', d.toString()));
//   serverProcess.stderr && serverProcess.stderr.on('data', d => console.error('[server err]', d.toString()));

//   serverProcess.on('error', (err) => {
//     console.error('Server spawn error:', err);
//   });

//   serverProcess.on('exit', (code) => {
//     console.log('[server] exited with code:', code);
//   });
// }

// function createWindow() {
//   // Don't create if already exists
//   if (mainWindow && !mainWindow.isDestroyed()) {
//     mainWindow.focus();
//     return;
//   }

//   mainWindow = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     minWidth: 1100,
//     minHeight: 700,
//     title: 'PH AgriTrader',
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//     titleBarStyle: 'default',
//     show: false,
//     backgroundColor: '#0f172a',
//   });

//   // Load the app
//   const indexPath = path.join(__dirname, 'client', 'build', 'index.html');
//   console.log('[main] isDev:', isDev);
//   console.log('[main] __dirname:', __dirname);
//   console.log('[main] indexPath:', indexPath);
//   if (isDev) {
//     mainWindow.loadURL('http://localhost:3000');
//   } else {
//     mainWindow.loadFile(indexPath).catch(err => {
//       console.error('[main] loadFile error:', err);
//       // Try alternate path (for packaged app)
//       const altPath = path.join(process.resourcesPath, 'client', 'build', 'index.html');
//       console.log('[main] trying altPath:', altPath);
//       mainWindow.loadFile(altPath).catch(e2 => console.error('[main] altPath also failed:', e2));
//     });
//   }

//   mainWindow.once('ready-to-show', () => {
//     mainWindow.show();
//     mainWindow.maximize();

//   });

//   // Block all popup windows — print handled via IPC
//   mainWindow.webContents.setWindowOpenHandler(() => {
//     return { action: 'deny' };
//   });

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// // ── If second instance tries to open, focus existing window ──
// app.on('second-instance', () => {
//   if (mainWindow) {
//     if (mainWindow.isMinimized()) mainWindow.restore();
//     mainWindow.focus();
//   }
// });

// // ── IPC: Print HTML ──────────────────────────────────────────
// ipcMain.on('print-html', (event, html) => {
//   const os  = require('os');
//   const fs2 = require('fs');

//   const tmpFile = path.join(os.tmpdir(), 'ph_print_' + Date.now() + '.html');
//   const safeHtml = html.includes('<meta charset')
//     ? html
//     : html.replace('<head>', '<head><meta charset="UTF-8">');
//   fs2.writeFileSync(tmpFile, safeHtml, 'utf8');

//   const printWin = new BrowserWindow({
//     width:  950,
//     height: 900,
//     show:   true,
//     autoHideMenuBar: true,
//     title:  'Print Preview',
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//   });

//   printWin.setMenuBarVisibility(false);
//   printWin.loadFile(tmpFile);

//   printWin.on('closed', () => {
//     try { fs2.unlinkSync(tmpFile); } catch (e) {}
//   });
// });

// // ── App ready ─────────────────────────────────────────────────
// app.whenReady().then(() => {
//   if (!isDev) {
//     startServer();
//     // Wait for server to start before opening window
//     setTimeout(createWindow, 1500);
//   } else {
//     createWindow();
//   }
// });

// // ── All windows closed ────────────────────────────────────────
// app.on('window-all-closed', () => {
//   if (serverProcess) {
//     serverProcess.kill();
//     serverProcess = null;
//   }
//   app.quit();
// });

// // ── macOS re-activate ─────────────────────────────────────────
// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });


const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// ── Single instance lock — prevents multiple windows opening ──
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  // Another instance is already running — quit this one
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let serverProcess = null;

const isDev = !app.isPackaged;

// ── Set app name ──────────────────────────────────────────────
app.setName('PH AgriTrader');

function startServer() {
  // In packaged app, files are inside app.asar - use process.resourcesPath
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar', 'server.js')
    : path.join(__dirname, 'server.js');

  console.log('[server] starting from:', serverPath);
  console.log('[server] node:', process.execPath);

  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      // Point to resources folder for native modules
      ELECTRON_RUN_AS_NODE: '1',
    },
    stdio: 'pipe',
  });

  serverProcess.stdout && serverProcess.stdout.on('data', d => console.log('[server]', d.toString()));
  serverProcess.stderr && serverProcess.stderr.on('data', d => console.error('[server err]', d.toString()));

  serverProcess.on('error', (err) => {
    console.error('Server spawn error:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log('[server] exited with code:', code);
  });
}

function createWindow() {
  // Don't create if already exists
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'PH AgriTrader',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#0f172a',
  });

  // Load the app
  const indexPath = path.join(__dirname, 'client', 'build', 'index.html');
  console.log('[main] isDev:', isDev);
  console.log('[main] __dirname:', __dirname);
  console.log('[main] indexPath:', indexPath);
  if (isDev) {
    mainWindow.loadURL('http://localhost:3200');
  } else {
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('[main] loadFile error:', err);
      // Try alternate path (for packaged app)
      const altPath = path.join(process.resourcesPath, 'client', 'build', 'index.html');
      console.log('[main] trying altPath:', altPath);
      mainWindow.loadFile(altPath).catch(e2 => console.error('[main] altPath also failed:', e2));
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // ── Allow about:blank popups for print windows only ──────────
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 950,
          height: 900,
          autoHideMenuBar: true,
          title: 'Print Preview',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        },
      };
    }
    // Block all other popups
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── If second instance tries to open, focus existing window ──
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// ── IPC: Print HTML via temp file ────────────────────────────
ipcMain.on('print-html', (event, html) => {
  const os  = require('os');
  const fs2 = require('fs');

  const tmpFile = path.join(os.tmpdir(), 'ph_print_' + Date.now() + '.html');

  // Ensure UTF-8 meta tag is present
  const safeHtml = html.includes('<meta charset')
    ? html
    : html.replace('<head>', '<head><meta charset="UTF-8">');

  fs2.writeFileSync(tmpFile, safeHtml, 'utf8');

  const printWin = new BrowserWindow({
    width:  950,
    height: 900,
    show:   true,
    autoHideMenuBar: true,
    title:  'Print Preview',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  printWin.setMenuBarVisibility(false);
  printWin.loadFile(tmpFile);

  // Clean up temp file when window closes
  printWin.on('closed', () => {
    try { fs2.unlinkSync(tmpFile); } catch (e) {}
  });
});

// ── App ready ─────────────────────────────────────────────────
app.whenReady().then(() => {
  if (!isDev) {
    startServer();
    // Wait for server to start before opening window
    setTimeout(createWindow, 1500);
  } else {
    createWindow();
  }
});

// ── All windows closed ────────────────────────────────────────
app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

// ── macOS re-activate ─────────────────────────────────────────
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});