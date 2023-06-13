import { ElectronPlugin } from './lib/electronPlugin';

export class gitPlugin extends ElectronPlugin {
  constructor(){
    super({
      displayName: 'git',
      name: 'git',
      description: 'git',
    })
    this.methods = ['log', 'status', 'add', 'commit', 'push', 'pull', 'clone', 'checkout', 'branch', 'merge', 'reset', 'revert', 'diff', 'stash', 'apply', 'cherryPick', 'rebase', 'tag', 'fetch', 'remote', 'config', 'show', 'init', 'help', 'version']
  }

  
}