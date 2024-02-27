// This menu label is overridden by OSX to be the appName
// The label is set to appName here so it matches actual behavior
import {app, BrowserWindow, MenuItemConstructorOptions} from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void,
  showAbout: () => void
): MenuItemConstructorOptions => {
  return {
    label: `${app.name}`,
    submenu: [
      {
        label: 'About Remix',
        click() {
          showAbout();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'quit',
        label: 'Quit Remix'
      }
    ]
  };
};
