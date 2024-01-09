import { ElectronPlugin } from '@remixproject/engine-electron';

export class electronTemplates extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'electronTemplates',
      name: 'electronTemplates',
      description: 'templates',
    })
  }
}
