import { ElectronPlugin } from '@remixproject/engine-electron';

export class xtermPlugin extends ElectronPlugin {
  constructor(){
    super({
      displayName: 'xterm',
      name: 'xterm',
      description: 'xterm',
    })
  }
}