import { ElectronPlugin } from '@remixproject/engine-electron';

export class isoGitPlugin extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'isogit',
      name: 'isogit',
      description: 'isogit',
    })
    this.methods = []
  }
}