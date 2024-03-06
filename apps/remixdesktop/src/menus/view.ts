import {BrowserWindow, MenuItemConstructorOptions} from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
): MenuItemConstructorOptions => {
  const isMac = process.platform === 'darwin';

  return {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform === 'darwin')

            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: function(item, focusedWindow) {
          if (focusedWindow){
            let factor = focusedWindow.webContents.getZoomFactor()
            if (factor < 4) {
              factor = factor + 0.25
              focusedWindow.webContents.setZoomFactor(factor)
            }
          }
        }
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: function(item, focusedWindow) {
          if (focusedWindow){
            let factor = focusedWindow.webContents.getZoomFactor()
            console.log(factor)
            if (factor > 1.25) {
              factor = factor - 0.25
              focusedWindow.webContents.setZoomFactor(factor)
            }else{
              focusedWindow.webContents.setZoomFactor(1)
            }

          }
        }
      },
      {
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+0',
        click: function(item, focusedWindow) {
          if (focusedWindow)
          {
            focusedWindow.webContents.setZoomFactor(1)
          }
        }
      },

    ]
  };
};
