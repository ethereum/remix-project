import { BrowserWindow, MenuItemConstructorOptions } from 'electron';

export default (
  commandKeys: Record<string, string>,
  execCommand: (command: string, focusedWindow?: BrowserWindow) => void
) => {
  const submenu: MenuItemConstructorOptions[] = [
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
    },
    {
      role: 'cut',
      accelerator: commandKeys['editor:cut'],
      registerAccelerator: true 
    },
    {
      role: 'selectAll',
      accelerator: commandKeys['editor:selectall'],
      registerAccelerator: true
    },
    {
      role: 'undo',
      accelerator: commandKeys['editor:undo'],
      registerAccelerator: true
    },
  ];

  return {
    label: 'Edit',
    submenu
  };
};
