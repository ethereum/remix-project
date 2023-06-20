import { app, BrowserWindow, dialog, Menu, MenuItem } from 'electron';
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

// get system home dir
const homeDir = app.getPath('userData')

const windowSet = new Set<BrowserWindow>([]);
export const createWindow = async (dir?: string): Promise<void> => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  });

  let params = dir ? `?opendir=${encodeURIComponent(dir)}` : '';
  // and load the index.html of the app.
  mainWindow.loadURL(
    process.env.NODE_ENV === 'production' || isPackaged ? `file://${__dirname}/remix-ide/index.html` + params :
      'http://localhost:8080' + params)

  mainWindow.maximize();

  // on close
  mainWindow.on('close', (event) => {
    console.log('close', event, mainWindow.webContents.id)
    windowSet.delete(mainWindow)
  })

  windowSet.add(mainWindow)

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  require('./engine')
});

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
import WindowMenu from './menus/window';
import EditMenu from './menus/edit';
import { execCommand } from './menus/commands';

const commandKeys: Record<string, string> = {
  'window:new': 'CmdOrCtrl+N',
  'folder:open': 'CmdOrCtrl+O',
};

const menu = [...(process.platform === 'darwin' ? [darwinMenu(commandKeys, execCommand, showAbout)] : []),
FileMenu(commandKeys, execCommand),
EditMenu(commandKeys, execCommand),
WindowMenu(commandKeys, execCommand, [])
]

Menu.setApplicationMenu(Menu.buildFromTemplate(menu))


import { glob, globSync, globStream, globStreamSync, Glob, GlobOptions } from 'glob'
import { PathScurry, Path } from 'path-scurry'



async function getDirectory(path: string, options?: GlobOptions): Promise<string[] | Path[]> {
  return await glob(path + '/**/*.sol', {
    withFileTypes: true,
    ...options
  })
}

function doGlobTest() {
  let startglob = new Date().getTime()
  console.log('start', startglob)
  getDirectory('/Volumes/bunsen/code/rmproject2/remix-project/apps/remix-ide/contracts').then((files) => {
    const result: any[] = []
    for (const file of files) {
      result.push({
        path: (file as Path).path,
        name: (file as Path).name,
        isDirectory: (file as Path).isDirectory(),
      })
    }
    console.log(result)
    const end = new Date().getTime()
    console.log('end glob', end - startglob)
  })

}
import fs, { Dirent } from 'fs'


async function readdir(path: string): Promise<Dirent[]> {
  // call node fs.readdir
  //console.log('readdir', path)
  if (!path) return []
  const files = fs.readdirSync(path, {
    withFileTypes: true
  })
  return files
}


function doReadDirTest() {
  let startreaddir = new Date().getTime()
  console.log('start', startreaddir)
  readdir('/Volumes/bunsen/code/rmproject2/remix-project/node_modules/').then((files) => {
    const result: any[] = []
    for (const file of files) {
      try {
        result.push({
          path: file.name,
          isDirectory: file.isDirectory(),
        })
      } catch (e) {
        console.log('error', e)
      }
    }
    console.log(result)
    const end = new Date().getTime()
    console.log('end readdir', end - startreaddir)
  })
}

function getFileList(dirName: string) {
  let files: any[] = [];
  const items = fs.readdirSync(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...getFileList(`${dirName}/${item.name}`)];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }

  return files;
};

function doFileListTest() {

  let startgetfilelist = new Date().getTime()
  console.log('start', startgetfilelist)
  const r = getFileList('/Volumes/bunsen/code/rmproject2/remix-project/node_modules/')
  console.log(r.length)
  const end = new Date().getTime()
  console.log('end getfilelist', end - startgetfilelist)

}

//doFileListTest()
doGlobTest()
//doReadDirTest()

/*
async function testScury() {
  const result: any[] = []
  const pw = new PathScurry('/Volumes/bunsen/code/rmproject2/remix-project/node_modules')
  for await (const entry of pw) {
    result.push({
      path: entry.path,
      isDirectory: entry.isDirectory(),
    })
  }
  return result
}

// log time 
let startscurry = new Date().getTime()
console.log('start', startscurry)
testScury().then((res) => {
  console.log(res.length)
  const end = new Date().getTime()
  console.log('end scurry', end - startscurry)
})
*/


