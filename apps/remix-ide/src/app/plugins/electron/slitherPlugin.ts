import { ElectronPlugin } from '@remixproject/engine-electron';

export class SlitherHandleDesktop extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'slither',
      name: 'slither',
      description: 'electron slither',
      methods: ['analyse']
    })
    this.methods = ['analyse']
  }
}
