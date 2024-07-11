import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import fs from 'fs/promises'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import { gitProxy } from "../tools/git";
import { isoGit } from "@remix-git"
import { branch, branchDifference, branchInputType, cloneInputType, commitChange, commitInputType, compareBranchesInput, currentBranchInput, fetchInputType, initInputType, logInputType, pullInputType, pushInputType, remote, resolveRefInput, statusInput } from "@remix-api";

const profile: Profile = {
  name: 'isogit',
  displayName: 'isogit',
  description: 'isogit plugin',
}
// used in e2e tests
const useIsoGit = process.argv.includes('--useIsoGit');
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
  methods: ['init', 'localStorageUsed', 'version', 'addremote', 'delremote', 'remotes', 'fetch', 'clone', 'export', 'import', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pin', 'pull', 'pinList', 'unPin', 'setIpfsConfig', 'zip', 'setItem', 'getItem', 'openFolder', 'getCommitChanges', 'compareBranches', 'startClone']
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
      this.gitIsInstalled = await gitProxy.version() && !useIsoGit ? true : false
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

  async status(cmd: statusInput) {
    console.log('status', cmd)
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

  async log(cmd: logInputType) {
    console.log('LOG', cmd)
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

  async commit(cmd: commitInputType) {
    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      const status = await gitProxy.commit(this.workingDir, cmd)
      return status
    }

    const commit = await git.commit({
      ...await this.getGitConfig(),
      ...cmd
    })

    return commit
  }

  async init(input: initInputType) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }
    if (this.gitIsInstalled) {
      const status = await gitProxy.init(this.workingDir)
      return status
    }
    await git.init({
      ...await this.getGitConfig(),
      defaultBranch: (input && input.defaultBranch) || 'main'
    })
  }

  async branch(cmd: branchInputType) {
    if (!this.workingDir || this.workingDir === '') {
      return null
    }
    const branch = await git.branch({
      ...await this.getGitConfig(),
      ...cmd
    })

    return branch
  }

  async resolveref(cmd: resolveRefInput) {
    console.log('RESOLVE REF', cmd)
    if (!this.workingDir || this.workingDir === '') {
      return null
    }

    const resolveref = await git.resolveRef({
      ...await this.getGitConfig(),
      ...cmd
    })
    console.log('RESOLVE REF', resolveref)
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

  async push(cmd: pushInputType) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      await gitProxy.push(this.workingDir, cmd)

    } else {
      /*
      const push = await git.push({
        ...await this.getGitConfig(),
        ...cmd,
        ...parseInput(cmd.input)
      })
      return push*/
    }

  }

  async pull(cmd: pullInputType) {

    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      await gitProxy.pull(this.workingDir, cmd)

    } else {
      /*
      const pull = await git.pull({
        ...await this.getGitConfig(),
        ...cmd,
        ...parseInput(cmd.input)
      })

      return pull
      */
    }
  }

  async fetch(cmd: fetchInputType) {
    console.log('FETCH', cmd)
    if (!this.workingDir || this.workingDir === '') {
      throw new Error('No working directory')
    }

    if (this.gitIsInstalled) {
      await gitProxy.fetch(this.workingDir, cmd)

    } else {
      /*
      const fetch = await git.fetch({
        ...await this.getGitConfig(),
        ...cmd,
        ...parseInput(cmd.input)
      })
      */
      return fetch
    }
  }

  async clone(cmd: cloneInputType) {

    if (this.gitIsInstalled) {
      try {
        await gitProxy.clone(cmd)
      } catch (e) {
        throw e
      }
    } else {
      try {
        /*
        this.call('terminal' as any, 'log', 'Cloning using builtin git... please wait.')
        const clone = await git.clone({
          ...await this.getGitConfig(),
          ...cmd,
          ...parseInput(cmd.input),
          dir: cmd.dir || this.workingDir
        })

        return clone
        */
      } catch (e) {
        console.log('CLONE ERROR', e)
        throw e
      }
    }
  }

  async addremote(input: remote) {

    const addremote = await git.addRemote({
      ...await this.getGitConfig(),
      url: input.url, remote: input.name
    })

    return addremote
  }

  async delremote(input: remote) {

    const delremote = await git.deleteRemote({
      ...await this.getGitConfig(),
      remote: input.name
    })

    return delremote
  }



  async remotes() {
    console.log('REMOTES')
    if (!this.workingDir || this.workingDir === '') {
      return []
    }
    const defaultConfig = await this.getGitConfig()
    return await isoGit.remotes(defaultConfig)
  }

  async currentbranch(input: currentBranchInput) {
    console.log('CURRENT BRANCH', input)
    if (!this.workingDir || this.workingDir === '') {
      return ''
    }
    const defaultConfig = await this.getGitConfig()
    return await isoGit.currentbranch(input, defaultConfig)
  }


  async branches(config: any) {
    console.log('BRANCHES')
    if (!this.workingDir || this.workingDir === '') {
      return []
    }

    const defaultConfig = await this.getGitConfig()
    return await isoGit.branches(defaultConfig)
  }


  async startClone() {
    this.call('filePanel' as any, 'clone')
  }

  async getCommitChanges(commitHash1: string, commitHash2: string): Promise<commitChange[]> {
    return await isoGit.getCommitChanges(commitHash1, commitHash2, await this.getGitConfig())
  }

  async compareBranches({ branch, remote }: compareBranchesInput): Promise<branchDifference> {
    return await isoGit.compareBranches({ branch, remote }, await this.getGitConfig())
  }

}



