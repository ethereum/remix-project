import { Engine, PluginManager, Plugin, PluginConnector } from '@remixproject/engine';
import { Message, Profile } from '@remixproject/plugin-utils';
import { ElectronPluginConnector } from './lib/electronPluginConnector';

export class fsPlugin extends ElectronPluginConnector {
  
  constructor(){
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    }, {
      sendAPI: window.api.sendToFS,
      receiveAPI: window.api.receiveFromFS
    })
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists']
  }

}