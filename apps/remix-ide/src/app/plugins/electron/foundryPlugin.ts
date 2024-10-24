import { ElectronPlugin } from '@remixproject/engine-electron';

export class FoundryHandleDesktop extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'foundry',
      name: 'foundry',
      description: 'electron foundry',
      methods: ['sync', 'compile']
    })
    this.methods = ['sync', 'compile']
  }
}
