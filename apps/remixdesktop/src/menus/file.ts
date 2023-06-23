import { BrowserWindow, MenuItemConstructorOptions } from 'electron';

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
        label: 'Open Folder',
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
        submenu: [
          {
            role: 'clearRecentDocuments'
          }
        ]
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
