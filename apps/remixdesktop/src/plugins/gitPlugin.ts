import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

const profile: Profile = {
  name: 'git',
  displayName: 'Git',
  description: 'Git plugin',
}

export class GitPlugin extends ElectronBasePlugin {
  client: PluginClient
  constructor() {
    super(profile, clientProfile, GitPluginClient)
  }

}

const clientProfile: Profile = {
  name: 'git',
  displayName: 'Git',
  description: 'Git plugin',
  methods: ['log', 'status', 'add', 'commit', 'push', 'pull', 'clone', 'checkout', 'branch', 'merge', 'reset', 'revert', 'diff', 'stash', 'apply', 'cherryPick', 'rebase', 'tag', 'fetch', 'remote', 'config', 'show', 'init', 'help', 'version']
}

// TODO: implement all native OS git commands
class GitPluginClient extends ElectronBasePluginClient {

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(() => {
      console.log('GitPluginClient onload')
    })
  }
  
}