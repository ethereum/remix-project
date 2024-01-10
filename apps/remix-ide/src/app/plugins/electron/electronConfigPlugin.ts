import { ElectronPlugin } from '@remixproject/engine-electron';

export class electronConfig extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'electronconfig',
      name: 'electronconfig',
      description: 'electronconfig',
    })
    this.methods = []
  }
}