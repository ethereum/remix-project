import { Plugin } from "@remixproject/engine";
import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { spawn } from "child_process";
import { createElectronClient } from "@remixproject/plugin-electron"
import { mainWindow } from "./main";

const profile: Profile = {
  name: 'git',
  displayName: 'Git',
  description: 'Git plugin',
}

export class GitPlugin extends Plugin {
  client: PluginClient
  constructor() {
    super(profile)
  }

  onActivation(): void {
    this.client = new GitPluginClient()
  }

}

class GitPluginClient extends PluginClient {
  constructor() {
    super()
    this.methods = ['log', 'status', 'add', 'commit', 'push', 'pull', 'clone', 'checkout', 'branch', 'merge', 'reset', 'revert', 'diff', 'stash', 'apply', 'cherryPick', 'rebase', 'tag', 'fetch', 'remote', 'config', 'show', 'init', 'help', 'version']
    createElectronClient(this, profile, mainWindow)
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