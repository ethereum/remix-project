import { Engine, PluginManager, Plugin, PluginConnector } from '@remixproject/engine';
import { Message, Profile } from '@remixproject/plugin-utils';
import { ElectronPluginConnector } from './lib/electronPluginConnector';

export class gitPlugin extends ElectronPluginConnector {
  constructor(){
    super({
      displayName: 'git',
      name: 'git',
      description: 'git',
    },{
      sendAPI: window.api.sendToGit,
      receiveAPI: window.api.receiveFromGit
    })
    this.methods = ['log', 'status', 'add', 'commit', 'push', 'pull', 'clone', 'checkout', 'branch', 'merge', 'reset', 'revert', 'diff', 'stash', 'apply', 'cherryPick', 'rebase', 'tag', 'fetch', 'remote', 'config', 'show', 'init', 'help', 'version']
  }
}