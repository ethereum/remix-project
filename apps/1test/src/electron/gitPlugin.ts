import { Plugin } from "@remixproject/engine";
import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { spawn } from "child_process";
import { createClient } from "./electronPluginClient";

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
    console.log('GitPlugin onActivation')
    this.client = new GitPluginClient()
  }
}

class GitPluginClient extends PluginClient {
  constructor() {
    super()
    this.methods = ['log', 'status', 'add', 'commit', 'push', 'pull', 'clone', 'checkout', 'branch', 'merge', 'reset', 'revert', 'diff', 'stash', 'apply', 'cherryPick', 'rebase', 'tag', 'fetch', 'remote', 'config', 'show', 'init', 'help', 'version']
    createClient(this, 'git')
    this.onload(() => {
      console.log('GitPluginClient onload')
    })
  }

  async log(path: string): Promise<string> {
    const log = spawn('git', ['log'], { cwd: path })

    return new Promise((resolve, reject) => {
       log.stdout.on('data', (data) => {
        resolve(data.toString())
       })
    })
  }

  
}