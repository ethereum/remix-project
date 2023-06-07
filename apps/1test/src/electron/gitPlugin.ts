import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { spawn } from "child_process";
import { ElectronBasePlugin, ElectronBasePluginClient } from "./lib/electronBasePlugin";

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

class GitPluginClient extends ElectronBasePluginClient {

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(() => {
      console.log('GitPluginClient onload')
    })
  }

  async log(path: string): Promise<string> {
    const log = spawn('git', ['log'], {
      cwd: path,
      env: {
        NODE_ENV: 'production',
        PATH: process.env.PATH,
      },
    })

    return new Promise((resolve, reject) => {
       log.stdout.on('data', (data) => {
        resolve(data.toString())
       })
    })
  }

  
}