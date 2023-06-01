import { ElectronPlugin } from './lib/electronPlugin';

export class fsPlugin extends ElectronPlugin {
  
  constructor(){
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    })
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists']
  }

}