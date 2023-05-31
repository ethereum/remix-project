import { Engine, PluginManager, Plugin, PluginConnector } from '@remixproject/engine';
import { Message, Profile } from '@remixproject/plugin-utils';
import { ElectronPluginConnector } from './electronPluginConnector';

export class fsPlugin extends ElectronPluginConnector {
  constructor(){
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    })
  }

  onActivation(): void {
    console.log('fsPlugin onActivation')
    //window.api.activatePlugin('fs')
  }

  protected connect(name: string) {
    console.log('fsPlugin connect', name)
    window.api.activatePlugin(name)
    window.api.receiveFromFS((event: any, message: any) => {
      console.log('fsPlugin fsClientSend message received', message)
      this.getMessage(message)
    })
  }

  protected send(message: Partial<Message>): void {
    console.log('fsPlugin send', message)
    window.api.sendToFS(message)
  }

  protected disconnect() {
    console.log('fsPlugin disconnect')
  }
}