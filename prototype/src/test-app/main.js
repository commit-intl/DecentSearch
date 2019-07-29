
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;
const createMainWindow = () => {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
      },
      show: false
    });

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  }
};

app.on('ready', createMainWindow);
app.on('activate', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
