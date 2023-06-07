import { app, BrowserWindow, dialog, Menu } from 'electron';
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

export let mainWindow: BrowserWindow;
export const createWindow = (): void => {
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

const showAbout = () => {


  void dialog.showMessageBox({
    title: `About Remix`,
    message: `Remix`,
    detail: `Remix`,
    buttons: [],
  });
};

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const isMac = process.platform === 'darwin'

import FileMenu from './menus/file';
import MainMenu from './menus/main';
import darwinMenu from './menus/darwin';
import { execCommand } from './menus/commands';

const commandKeys: Record<string, string> = {
  'window:new': 'CmdOrCtrl+N',
  'folder:open': 'CmdOrCtrl+O',
};


const menu = [...(process.platform === 'darwin' ? [darwinMenu(commandKeys, execCommand, showAbout)] : []), FileMenu(commandKeys, execCommand)]
Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
