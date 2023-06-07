import {app, Menu, BrowserWindow} from 'electron';
import { createWindow } from '../../';

const commands: Record<string, (focusedWindow?: BrowserWindow) => void> = {
  'window:new': () => {
    // If window is created on the same tick, it will consume event too
    setTimeout(createWindow, 0);
  },

};


export const execCommand = (command: string, focusedWindow?: BrowserWindow) => {
  const fn = commands[command];
  if (fn) {
    fn(focusedWindow);
  }
};
