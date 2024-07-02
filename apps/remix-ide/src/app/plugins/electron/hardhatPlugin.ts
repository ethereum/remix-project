import { ElectronPlugin } from '@remixproject/engine-electron';

export class HardhatHandleDesktop extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'hardhat',
      name: 'hardhat',
      description: 'electron hardhat',
      methods: ['sync', 'compile']
    })
    this.methods = ['sync', 'compile']
  }
}
