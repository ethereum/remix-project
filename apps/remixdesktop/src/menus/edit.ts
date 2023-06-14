import { BrowserWindow, MenuItemConstructorOptions } from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
) => {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: 'Cut',
      accelerator: commandKeys['editor:cut'],
      enabled: false
    },
    {
      role: 'copy',
      command: 'editor:copy',
      accelerator: commandKeys['editor:copy'],
      registerAccelerator: true
    } as any,
    {
      role: 'paste',
      accelerator: commandKeys['editor:paste'],
      registerAccelerator: true
    }
  ];

  if (process.platform !== 'darwin') {
    submenu.push(
      { type: 'separator' },
      {
        label: 'Preferences...',
        accelerator: commandKeys['window:preferences'],
        click() {
          execCommand('window:preferences');
        }
      }
    );
  }

  return {
    label: 'Edit',
    submenu
  };
};
