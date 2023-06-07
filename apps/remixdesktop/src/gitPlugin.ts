import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { spawn } from "child_process";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

const profile: Profile = {
  name: 'git',
  displayName: 'Git',
  description: 'Git plugin',
}

export class GitPlugin extends ElectronBasePlugin {
  client: PluginClient
  constructor() {
    super(profile)
  }

  async createClient(webContentsId: number): Promise<void> {
    this.clients.push(new GitPluginClient(webContentsId))
  }

  async closeClient(webContentsId: number): Promise<void> {
    console.log('closeClient', webContentsId)
  }


}

const clientProfile: Profile = {
  name: 'git',
  displayName: 'Git',
  description: 'Git plugin',
  methods: ['log', 'status', 'add', 'commit', 'push', 'pull', 'clone', 'checkout', 'branch', 'merge', 'reset', 'revert', 'diff', 'stash', 'apply', 'cherryPick', 'rebase', 'tag', 'fetch', 'remote', 'config', 'show', 'init', 'help', 'version']
}

class GitPluginClient extends ElectronBasePluginClient {

  constructor(webContentsId: number) {
    super(webContentsId, clientProfile)
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