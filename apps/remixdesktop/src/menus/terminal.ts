import {BrowserWindow, MenuItemConstructorOptions} from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
): MenuItemConstructorOptions => {
  const isMac = process.platform === 'darwin';

  return {
    label: 'Terminal',
    submenu: [
      {
        label: 'New Terminal',
        click(item, focusedWindow) {
          execCommand('terminal:new', focusedWindow);
        }
      }
    ]
  };
};
