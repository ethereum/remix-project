import { ElectronPlugin } from '@remixproject/engine-electron';

export class ripgrepPlugin extends ElectronPlugin {
  constructor(){
    super({
      displayName: 'ripgrep',
      name: 'ripgrep',
      description: 'ripgrep'
    })
    this.methods = ['glob']
  }
}