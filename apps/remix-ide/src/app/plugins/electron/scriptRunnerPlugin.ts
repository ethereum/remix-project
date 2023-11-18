import { ElectronPlugin } from '@remixproject/engine-electron';

export class scriptRunnerPlugin extends ElectronPlugin {
  constructor(){
    super({
      displayName: 'scriptRunner',
      name: 'scriptRunner',
      description: 'scriptRunner'
    })
  }
}