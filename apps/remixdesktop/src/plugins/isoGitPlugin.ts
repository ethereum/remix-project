import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import fs from 'fs/promises'
import git from 'isomorphic-git'
import { dialog } from "electron";
import http from 'isomorphic-git/http/web'
import { gitProxy } from "../tools/git";

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
  methods: ['init', 'localStorageUsed',  'version', 'addremote', 'delremote', 'remotes', 'fetch', 'clone', 'export', 'import', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pin', 'pull', 'pinList', 'unPin', 'setIpfsConfig', 'zip', 'setItem', 'getItem', 'openFolder']
}

class IsoGitPluginClient extends ElectronBasePluginClient {
  workingDir: string = '/Volumes/bunsen/code/empty/'
  gitIsInstalled: boolean = false
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(() => {
      console.log('IsoGit client onload')
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        console.log('workingDirChanged', path)
        this.workingDir = path
        this.gitIsInstalled = await gitProxy.version() ? true : false
        if (this.gitIsInstalled) {
          console.log('git is installed')
        }
      })
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
    console.log('status', cmd)

    if(this.gitIsInstalled){
      const status = await gitProxy.status(this.workingDir)
      console.log('STATUS', status)
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

    console.log('log')
    const log = await git.log({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('LOG', log)
    return log
  }

  async add(cmd: any) {
    console.log('add')
    const add = await git.add({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('ADD', add)
    return add
  }

  async rm(cmd: any) {
    console.log('rm')
    const rm = await git.remove({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('RM', rm)
    return rm
  }

  async commit(cmd: any) {
    console.log('commit')
    const commit = await git.commit({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('COMMIT', commit)
    return commit
  }

  async init(input: any) {
    await git.init({
      ...await this.getGitConfig(),
      defaultBranch: (input && input.branch) || 'main'
    })
  }

  async branch(cmd: any) {
    console.log('branch')
    const branch = await git.branch({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('BRANCH', branch)
    return branch
  }

  async lsfiles(cmd: any) {
    console.log('lsfiles')
    const lsfiles = await git.listFiles({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('LSFILES', lsfiles)
    return lsfiles
  }

  async resolveref(cmd: any) {
    console.log('resolveref')
    const resolveref = await git.resolveRef({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('RESOLVEREF', resolveref)
    return resolveref
  }


  async readblob(cmd: any) {
    console.log('readblob')
    const readblob = await git.readBlob({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('READBLOB', readblob)
    return readblob
  }

  async checkout(cmd: any) {
    console.log('checkout')
    const checkout = await git.checkout({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('CHECKOUT', checkout)
    return checkout
  }

  async push(cmd: any) {
    console.log('push')
    const push = await git.push({
      ...await this.getGitConfig(),
      ...cmd,
      ...parseInput(cmd.input)
    })
    console.log('PUSH', push)
    return push
  }

  async pull(cmd: any) {
    console.log('pull', cmd)
    const pull = await git.pull({
      ...await this.getGitConfig(),
      ...cmd,
      ...parseInput(cmd.input)
    })
    console.log('PULL', pull)
    return pull
  }

  async fetch(cmd: any) {
    console.log('fetch', cmd)
    const fetch = await git.fetch({
      ...await this.getGitConfig(),
      ...cmd,
      ...parseInput(cmd.input)
    })
    console.log('FETCH', fetch)
    return fetch
  }

  async clone(cmd: any) {
    console.log('clone')

    if (this.gitIsInstalled) {
      await gitProxy.clone(cmd.url, cmd.dir)
      console.log('CLONING WITH NATIVE GIT', cmd)
    } else {
      try {
        const clone = await git.clone({
          ...await this.getGitConfig(),
          ...cmd,
          ...parseInput(cmd.input),
          dir: cmd.dir || this.workingDir
        })
        console.log('CLONE', clone)
        return clone
      } catch (e) {
        console.log('CLONE ERROR', e)
        throw e
      }
    }
  }

  async addremote(cmd: any) {
    console.log('addremote')
    const addremote = await git.addRemote({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('ADDREMOTE', addremote)
    return addremote
  }

  async delremote(cmd: any) {
    console.log('delremote')
    const delremote = await git.deleteRemote({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('DELREMOTE', delremote)
    return delremote
  }



  remotes = async () => {
    let remotes = []
    remotes = await git.listRemotes({ ...await this.getGitConfig() })
    console.log('remotes', remotes)
    return remotes
  }

  async currentbranch() {
    try {
      const defaultConfig = await this.getGitConfig()
      const name = await git.currentBranch(defaultConfig)
      console.log('currentbranch', name)
      return name
    } catch (e) {
      return ''
    }
  }


  async branches() {
    try {
      let cmd: any = { ...await this.getGitConfig() }
      const remotes = await this.remotes()
      let branches = []
      branches = (await git.listBranches(cmd)).map((branch) => { return { remote: undefined, name: branch } })
      for (const remote of remotes) {
        cmd = {
          ...cmd,
          remote: remote.remote
        }

        const remotebranches = (await git.listBranches(cmd)).map((branch) => { return { remote: remote.remote, name: branch } })
        branches = [...branches, ...remotebranches]

      }
      console.log('branches', branches)
      return branches
    } catch (e) {
      return []
    }
  }


  async startClone() {
    this.call('filePanel' as any, 'clone')
  }

}



