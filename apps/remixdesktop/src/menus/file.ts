import { BrowserWindow, MenuItemConstructorOptions, app, ipcMain } from 'electron';
import fs from 'fs'
import os from 'os'
import path from 'path'
import { cacheDir } from '../utils/config';

let recentFolders: string[] = []

if (fs.existsSync(cacheDir + '/remixdesktop.json')) {
  try {
    // read the cache file
    const cache = fs.readFileSync(cacheDir + '/remixdesktop.json')
    const data = JSON.parse(cache.toString())
    recentFolders = data && data.recentFolders || []
    console.log('recentFolders', recentFolders)
  } catch (e) {

  }
}

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
): MenuItemConstructorOptions => {
  const isMac = process.platform === 'darwin';

  return {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: commandKeys['window:new'],
        click(item, focusedWindow) {
          execCommand('window:new', focusedWindow);
        }
      },
      {
        label: 'Open Folder in New Window',
        accelerator: commandKeys['folder:open'],
        click(item, focusedWindow) {
          execCommand('folder:open', focusedWindow);
        }
      },
      {
        label: 'Load Template in New Window',
        click(item, focusedWindow) {
          execCommand('template:open', focusedWindow);
        }
      },
      {
        role: 'recentDocuments',
        submenu: recentFolders.map((folder) => {
          return {
            label: folder,
            click(item, focusedWindow) {
              if(focusedWindow) {
                ipcMain.emit('fs:openFolder', focusedWindow.webContents.id, folder);
              }
            }
          }
        })
      },
      {
        role: 'close',
        accelerator: commandKeys['window:close']
      },
      {
        role: 'quit',
      }
    ]
  };
};
