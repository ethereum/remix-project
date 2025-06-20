import {BaseWindow, BrowserWindow, MenuItemConstructorOptions} from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BaseWindow) => void
): MenuItemConstructorOptions => {
  const isMac = process.platform === 'darwin';

  return {
    label: 'Git',
    submenu: [
      {
        label: 'Clone Repository in New Window',
        click(item, focusedWindow) {
          execCommand('git:startclone', focusedWindow);
        }
      }
    ]
  };
};
