import { ElectronPlugin } from '@remixproject/engine-electron';

export class fsPlugin extends ElectronPlugin {
  
  constructor(){
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    })
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists']
  }

  async onActivation() {
    console.log('fsPluginClient onload')
  }

}