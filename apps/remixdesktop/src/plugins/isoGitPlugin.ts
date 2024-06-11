import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import fs from 'fs/promises'
import git from 'isomorphic-git'
import { dialog } from "electron";
import http from 'isomorphic-git/http/web'
import { gitProxy } from "../tools/git";
import { remote } from "../types";

const profile: Profile = {
  name: 'isogit',
  displayName: 'isogit',
  description: 'isogit plugin',
}

export class IsoGitPlugin extends ElectronBasePlugin {
  clients: IsoGitPluginClient[] = []
  constructor() {
    super(profile, clientProfile, IsoGitPluginClient)
  }

  startClone(webContentsId: any): void {
    const client = this.clients.find(c => c.webContentsId === webContentsId)
    if (client) {
      client.startClone()
    }
  }
}

const parseInput = (input: any) => {
  return {
    corsProxy: 'https://corsproxy.remixproject.org/',
    http,
    onAuth: (url: any) => {
      url
      const auth = {
        username: input.token,
        password: ''
      }
      return auth
    }
  }
}

const clientProfile: Profile = {
  name: 'isogit',
  displayName: 'isogit',
  description: 'isogit plugin',
  methods: ['init', 'localStorageUsed', 'version', 'addremote', 'delremote', 'remotes', 'fetch', 'clone', 'export', 'import', 'status', 'log', 'commit', 'add', 'remove', 'reset', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pin', 'pull', 'pinList', 'unPin', 'setIpfsConfig', 'zip', 'setItem', 'getItem', 'openFolder']
}

class IsoGitPluginClient extends ElectronBasePluginClient {
  workingDir: string = ''
  gitIsInstalled: boolean = false
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(async () => {
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
        this.gitIsInstalled = await gitProxy.version() ? true : false
      })
      this.workingDir = await this.call('fs' as any, 'getWorkingDir')
      this.gitIsInstalled = await gitProxy.version() ? true : false
    })
  }

  async version() {
    return gitProxy.version()
  }

  async getGitConfig() {
    return {
      fs,
      dir: this.workingDir,
    }
  }

  async status(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }


    if (this.workingDir === '') {
      return []
    }

    if (this.gitIsInstalled) {
      const status = await gitProxy.status(this.workingDir)
      return status
    }

    const status = await git.statusMatrix({
      ...await this.getGitConfig(),
      ...cmd
    })
    //console.log('STATUS', status, await this.getGitConfig())
    return status
  }

  async log(cmd: any) {

    /* we will use isomorphic git for now
    if(this.gitIsInstalled){
      const log = await gitProxy.log(this.workingDir, cmd.ref)
      console.log('LOG', log)
      return log
    }
    */

    if (this.workingDir === '') {
      return []
    }

    const log = await git.log({
      ...await this.getGitConfig(),
      ...cmd
    })

    return log
  }

  async add(cmd: any) {
    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    const add = await git.add({
      ...await this.getGitConfig(),
      ...cmd
    })

    return add
  }

  async rm(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    const rm = await git.remove({
      ...await this.getGitConfig(),
      ...cmd
    })

    return rm
  }

  async reset(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    const reset = await git.resetIndex({
      ...await this.getGitConfig(),
      ...cmd
    })

    return reset
  }


  async commit(cmd: any) {
    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      const status = await gitProxy.commit(this.workingDir, cmd.message)
      return status
    }

    const commit = await git.commit({
      ...await this.getGitConfig(),
      ...cmd
    })

    return commit
  }

  async init(input: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }
    if (this.gitIsInstalled) {
      const status = await gitProxy.init(this.workingDir)
      return status
    }
    await git.init({
      ...await this.getGitConfig(),
      defaultBranch: (input && input.branch) || 'main'
    })
  }

  async branch(cmd: any) {
    if (!this.workingDir || this.workingDir === '') {
      return null
    }
    const branch = await git.branch({
      ...await this.getGitConfig(),
      ...cmd
    })

    return branch
  }

  async lsfiles(cmd: any) {
    if (!this.workingDir || this.workingDir === '') {
      return []
    }
    const lsfiles = await git.listFiles({
      ...await this.getGitConfig(),
      ...cmd
    })
    return lsfiles
  }

  async resolveref(cmd: any) {
    if (!this.workingDir || this.workingDir === '') {
      return null
    }

    const resolveref = await git.resolveRef({
      ...await this.getGitConfig(),
      ...cmd
    })

    return resolveref
  }


  async readblob(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    const readblob = await git.readBlob({
      ...await this.getGitConfig(),
      ...cmd
    })

    return readblob
  }

  async checkout(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    const checkout = await git.checkout({
      ...await this.getGitConfig(),
      ...cmd
    })

    return checkout
  }

  async push(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      await gitProxy.push(this.workingDir, cmd.remote, cmd.ref, cmd.remoteRef, cmd.force)

    } else {

      const push = await git.push({
        ...await this.getGitConfig(),
        ...cmd,
        ...parseInput(cmd.input)
      })
      return push
    }

  }

  async pull(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      await gitProxy.pull(this.workingDir, cmd.remote, cmd.ref, cmd.remoteRef)

    } else {

      const pull = await git.pull({
        ...await this.getGitConfig(),
        ...cmd,
        ...parseInput(cmd.input)
      })

      return pull

    }
  }

  async fetch(cmd: any) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      await gitProxy.fetch(this.workingDir, cmd.remote, cmd.remoteRef)

    } else {

      const fetch = await git.fetch({
        ...await this.getGitConfig(),
        ...cmd,
        ...parseInput(cmd.input)
      })

      return fetch
    }
  }

  async clone(cmd: any) {

    if (this.gitIsInstalled) {
      try {
        await gitProxy.clone(cmd.url, cmd.dir)
      } catch (e) {
        throw e
      }
    } else {
      try {
        const clone = await git.clone({
          ...await this.getGitConfig(),
          ...cmd,
          ...parseInput(cmd.input),
          dir: cmd.dir || this.workingDir
        })

        return clone
      } catch (e) {
        console.log('CLONE ERROR', e)
        throw e
      }
    }
  }

  async addremote(cmd: any) {

    const addremote = await git.addRemote({
      ...await this.getGitConfig(),
      ...cmd
    })

    return addremote
  }

  async delremote(cmd: any) {

    const delremote = await git.deleteRemote({
      ...await this.getGitConfig(),
      ...cmd
    })

    return delremote
  }



  remotes = async () => {
    if (!this.workingDir || this.workingDir === '') {
      return []
    }
    let remotes: remote[] = []
    remotes = (await git.listRemotes({ ...await this.getGitConfig() })).map((remote) => { return { name: remote.remote, url: remote.url } }
    )
    return remotes
  }

  async currentbranch() {
    if (!this.workingDir || this.workingDir === '') {
      return ''
    }
    try {
      const defaultConfig = await this.getGitConfig()
      const name = await git.currentBranch(defaultConfig)

      return name
    } catch (e) {
      return ''
    }
  }


  async branches() {
    if (!this.workingDir || this.workingDir === '') {
      return []
    }
    try {
      let cmd: any = { ...await this.getGitConfig() }
      const remotes = await this.remotes()
      let branches = []
      branches = (await git.listBranches(cmd)).map((branch) => { return { remote: undefined, name: branch } })
      for (const remote of remotes) {
        cmd = {
          ...cmd,
          remote: remote.name
        }

        const remotebranches = (await git.listBranches(cmd)).map((branch) => { return { remote: remote.name, name: branch } })
        branches = [...branches, ...remotebranches]

      }

      return branches
    } catch (e) {
      return []
    }
  }


  async startClone() {
    this.call('filePanel' as any, 'clone')
  }

}



