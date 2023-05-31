import { Engine, PluginManager, Plugin, PluginConnector } from '@remixproject/engine';
import { Message, Profile } from '@remixproject/plugin-utils';
import { ElectronPluginConnector } from './electronPluginConnector';

export class gitPlugin extends ElectronPluginConnector {
  constructor(){
    super({
      displayName: 'git',
      name: 'git',
      description: 'git',
    })
  }

  onActivation(): void {
    console.log('git onActivation')
    //window.api.activatePlugin('fs')
  }

  protected connect(name: string) {
    console.log('git connect', name)
    window.api.activatePlugin(name)
    window.api.receiveFromGit((event: any, message: any) => {
      console.log('git fsClientSend message received', message)
      this.getMessage(message)
    })
  }

  protected send(message: Partial<Message>): void {
    console.log('git send', message)
    window.api.sendToGit(message)
  }

  protected disconnect() {
    console.log('git disconnect')
  }
}