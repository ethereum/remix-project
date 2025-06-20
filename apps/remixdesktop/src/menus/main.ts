import {BrowserWindow, MenuItemConstructorOptions} from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
): MenuItemConstructorOptions => {
  const isMac = process.platform === 'darwin';

  return {
    label: 'REMIX',
    submenu: [
      {
        label: 'Close',
        accelerator: commandKeys['pane:close'],
        click(item, focusedWindow) {
          execCommand('pane:close', focusedWindow);
        }
      },
      {
        label: isMac ? 'Close Window' : 'Quit',
        role: 'close',
        accelerator: commandKeys['window:close']
      }
    ]
  };
};
