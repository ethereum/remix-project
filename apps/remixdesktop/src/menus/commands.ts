import {app, Menu, BrowserWindow, ipcMain} from 'electron';
import { createWindow } from '../main';


const commands: Record<string, (focusedWindow?: BrowserWindow) => void> = {
  'window:new': () => {
    // If window is created on the same tick, it will consume event too
    setTimeout(createWindow, 0);
  },
  'folder:open': (focusedWindow) => {
    if (focusedWindow) {
      ipcMain.emit('fs:openFolder', focusedWindow.webContents.id);
    }
  },
  'terminal:new': (focusedWindow) => {
    if (focusedWindow) {
      ipcMain.emit('terminal:new', focusedWindow.webContents.id);
    }
  },
  'template:open': (focusedWindow) => {
    if (focusedWindow) {
      ipcMain.emit('template:open', focusedWindow.webContents.id);
    }
  },
  'git:startclone': (focusedWindow) => {
    if (focusedWindow) {
      ipcMain.emit('git:startclone', focusedWindow.webContents.id);
    }
  }

};


export const execCommand = (command: string, focusedWindow?: BrowserWindow) => {
  const fn = commands[command];
  if (fn) {
    fn(focusedWindow);
  }
};
