import { ElectronPlugin } from './lib/electronPlugin';

export class xtermPlugin extends ElectronPlugin {
  
  constructor(){
    super({
      displayName: 'xterm',
      name: 'xterm',
      description: 'xterm',
    })
  }

}