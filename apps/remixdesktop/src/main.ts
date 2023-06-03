import { app, BrowserWindow } from 'electron';
import path from 'path';


let isPackaged = false;

if (
  process.mainModule &&
  process.mainModule.filename.indexOf('app.asar') !== -1
) {
  isPackaged = true;
} else if (process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 0) {
  isPackaged = true;
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
export let mainWindow: BrowserWindow;
const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1024,
    webPreferences: {
       preload: path.join(__dirname, 'preload.js')
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    process.env.NODE_ENV === 'production' || isPackaged? `file://${__dirname}/remix-ide/index.html` :
    'http://localhost:8080')

  mainWindow.maximize();
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  require('./engine')
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
