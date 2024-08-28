'use strict'

import {
  Plugin
} from '@remixproject/engine'
import git, { ReadBlobResult, ReadCommitResult, StatusRow } from 'isomorphic-git'
import IpfsHttpClient from 'ipfs-http-client'
import {
  saveAs
} from 'file-saver'
import http from 'isomorphic-git/http/web'

import JSZip from 'jszip'
import path from 'path'
import FormData from 'form-data'
import axios from 'axios'
import { Registry } from '@remix-project/remix-lib'
import { Octokit, App } from "octokit"
import { OctokitResponse } from '@octokit/types'
import { Endpoints } from "@octokit/types"
import { IndexedDBStorage } from './filesystems/indexedDB'
import { GitHubUser, branch, commitChange, remote, pagedCommits, remoteCommitsInputType, cloneInputType, fetchInputType, pullInputType, pushInputType, currentBranchInput, branchInputType, addInput, rmInput, resolveRefInput, readBlobInput, repositoriesInput, commitInput, branchDifference, compareBranchesInput, initInput, userEmails, checkoutInput } from '@remix-ui/git'
import { LibraryProfile, StatusEvents } from '@remixproject/plugin-utils'
import { ITerminal } from '@remixproject/plugin-api/src/lib/terminal'
import { partial } from 'lodash'

declare global {
  interface Window { remixFileSystemCallback: IndexedDBStorage; remixFileSystem: any; }
}

const profile: LibraryProfile = {
  name: 'dgitApi',
  displayName: 'Decentralized git',
  description: 'Decentralized git provider',
  icon: 'assets/img/fileManager.webp',
  version: '0.0.1',
  methods: ['init', 'localStorageUsed', 'addremote', 'delremote', 'remotes', 'fetch', 'clone', 'export', 'import', 'status', 'log', 'commit', 'add', 'remove', 'reset', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pull', 'setIpfsConfig', 'zip', 'setItem', 'getItem', 'version', 'updateSubmodules'
    , 'getGitHubUser', 'remotebranches', 'remotecommits', 'repositories', 'getCommitChanges', 'compareBranches'],
  kind: 'file-system'
}
class DGitProvider extends Plugin {
  ipfsconfig: { host: string; port: number; protocol: string; ipfsurl: string }
  globalIPFSConfig: { host: string; port: number; protocol: string; ipfsurl: string }
  remixIPFS: { host: string; port: number; protocol: string; ipfsurl: string }
  ipfsSources: any[]
  ipfs: any
  filesToSend: any[]
  constructor() {
    super(profile)
    this.ipfsconfig = {
      host: 'jqgt.remixproject.org',
      port: 443,
      protocol: 'https',
      ipfsurl: 'https://jqgt.remixproject.org/ipfs/'
    }
    this.globalIPFSConfig = {
      host: 'ipfs.io',
      port: 443,
      protocol: 'https',
      ipfsurl: 'https://ipfs.io/ipfs/'
    }
    this.remixIPFS = {
      host: 'jqgt.remixproject.org',
      port: 443,
      protocol: 'https',
      ipfsurl: 'https://jqgt.remixproject.org/ipfs/'
    }
    this.ipfsSources = [this.remixIPFS, this.globalIPFSConfig, this.ipfsconfig]
  }

  async addIsomorphicGitConfigFS(dir = '') {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return {
        fs: window.remixFileSystem,
        dir: '/'
      }
    }

    const workspace = await this.call('filePanel', 'getCurrentWorkspace')

    if (!workspace) return
    return {
      fs: window.remixFileSystemCallback,
      dir: addSlash(path.join(workspace.absolutePath, dir || '')),
    }
  }

  async addIsomorphicGitConfig(input) {

    const token = await this.call('config' as any, 'getAppParameter', 'settings/gist-access-token')

    let config = {
      corsProxy: 'https://corsproxy.remixproject.org/',
      http,
      onAuth: url => {
        url
        const auth = {
          username: input.token || token,
          password: ''
        }
        return auth
      }
    }
    if (input.url) {

      const url = new URL(input.url)
      if (url.hostname.includes('localhost')) {
        config = {
          ...config,
          corsProxy: null
        }
      }
    }
    if ((input.remote && input.remote.url)) {

      const url = new URL(input.remote.url)
      if (url.hostname.includes('localhost')) {
        config = {
          ...config,
          corsProxy: null,
        }
      }
    }

    if (input.provider && input.provider === 'github') {
      config = {
        ...config,
        corsProxy: 'https://corsproxy.remixproject.org/',
      }
    }

    if (input.provider && input.provider === 'localhost') {
      config = {
        ...config,
        corsProxy: null
      }
    }

    return config
  }

  async getCommandUser(input) {
    const author = {
      name: '',
      email: ''
    }
    if (input && input.name && input.email) {
      author.name = input.name
      author.email = input.email
    } else {
      const username = await this.call('config' as any, 'getAppParameter', 'settings/github-user-name')
      const email = await this.call('config' as any, 'getAppParameter', 'settings/github-email')
      const token = await this.call('config' as any, 'getAppParameter', 'settings/gist-access-token')
      if (username && email) {
        author.name = username
        author.email = email
      } else if (token) {

        const gitHubUser = await this.getGitHubUser({ token })

        if (gitHubUser) {
          author.name = gitHubUser.user.login
        }
      }
    }
    return author
  }

  async init(input?: initInput): Promise<void> {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'init', {
        defaultBranch: (input && input.defaultBranch) || 'main'
      })
      this.emit('init')
      return
    }

    await git.init({
      ...await this.addIsomorphicGitConfigFS(),
      defaultBranch: (input && input.defaultBranch) || 'main'
    })
    this.emit('init')
  }

  async version() {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'version')
    }

    const version = 'built-in'
    return version
  }

  async status(cmd): Promise<Array<StatusRow>> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const status = await this.call('isogit', 'status', cmd)

      return status
    }

    const status = await git.statusMatrix({
      ...await this.addIsomorphicGitConfigFS(),
      ...cmd
    })

    return status
  }

  async add(cmd: addInput): Promise<void> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'add', cmd)
    } else {
      await git.add({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd
      })
    }

    this.emit('add')
  }

  async rm(cmd: rmInput) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'rm', cmd)
    } else {
      await git.remove({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd
      })
      this.emit('rm')

    }
  }

  async reset(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'reset', cmd)
    } else {
      await git.resetIndex({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd
      })
      this.emit('rm')

    }
  }

  async checkout(cmd: checkoutInput): Promise<void> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'checkout', cmd)
    } else {
      const gitmodules = await this.parseGitmodules() || []
      await git.checkout({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd
      })
      const newgitmodules = await this.parseGitmodules() || []
      // find the difference between the two gitmodule versions
      const toRemove = gitmodules.filter((module) => {
        return !newgitmodules.find((newmodule) => {
          return newmodule.name === module.name
        })
      })

      for (const module of toRemove) {
        const path = (await this.addIsomorphicGitConfigFS(module.path)).dir
        if (await window.remixFileSystem.exists(path)) {
          const stat = await window.remixFileSystem.stat(path)
          try {
            if (stat.isDirectory()) {
              await window.remixFileSystem.unlink((await this.addIsomorphicGitConfigFS(module.path)).dir)
            }
          } catch (e) {
            // do nothing
          }
        }
      }
    }
    if (cmd.refresh) {
      setTimeout(async () => {
        await this.call('fileManager', 'refresh')
      }, 1000)
    }

    this.emit('checkout')
  }

  async log(cmd: { ref: string }): Promise<ReadCommitResult[]> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const status = await this.call('isogit', 'log', {
        ...cmd,
        depth: 10
      })

      return status
    }

    const status = await git.log({
      ...await this.addIsomorphicGitConfigFS(),
      ...cmd,
    })
    return status
  }

  async compareBranches({ branch, remote }: compareBranchesInput): Promise<branchDifference> {
    // Get current branch commits
    const headCommits = await git.log({
      ...await this.addIsomorphicGitConfigFS(),
      ref: branch.name,
    });

    // Get remote branch commits
    const remoteCommits = await git.log({
      ...await this.addIsomorphicGitConfigFS(),
      ref: `${remote.name}/${branch.name}`,
    });

    // Convert arrays of commit objects to sets of commit SHAs
    const headCommitSHAs = new Set(headCommits.map(commit => commit.oid));
    const remoteCommitSHAs = new Set(remoteCommits.map(commit => commit.oid));

    // Filter out commits that are only in the remote branch
    const uniqueRemoteCommits = remoteCommits.filter(commit => !headCommitSHAs.has(commit.oid));

    // filter out commits that are only in the local branch
    const uniqueHeadCommits = headCommits.filter(commit => !remoteCommitSHAs.has(commit.oid));

    return {
      uniqueHeadCommits,
      uniqueRemoteCommits,
    };
  }

  async getCommitChanges(commitHash1: string, commitHash2: string): Promise<commitChange[]> {
    const result: commitChange[] = await git.walk({
      ...await this.addIsomorphicGitConfigFS(),
      trees: [git.TREE({ ref: commitHash1 }), git.TREE({ ref: commitHash2 })],
      map: async function (filepath, [A, B]) {

        if (filepath === '.') {
          return
        }
        try {
          if ((A && await A.type()) === 'tree' || B && (await B.type()) === 'tree') {
            return
          }
        } catch (e) {
          // ignore
        }

        // generate ids
        const Aoid = A && await A.oid() || undefined
        const Boid = B && await B.oid() || undefined

        const commitChange: Partial<commitChange> = {
          hashModified: commitHash1,
          hashOriginal: commitHash2,
          path: filepath,
        }

        // determine modification type
        if (Aoid !== Boid) {
          commitChange.type = "modified"
        }
        if (Aoid === undefined) {
          commitChange.type = "deleted"
        }
        if (Boid === undefined || !commitHash2) {
          commitChange.type = "added"
        }
        if (Aoid === undefined && Boid === undefined) {
          commitChange.type = "unknown"
        }
        if (commitChange.type)
          return commitChange
        else
          return undefined
      },
    })

    return result
  }

  async remotes(config): Promise<remote[]> {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'remotes', config)
    }

    let remotes: remote[] = []
    try {
      remotes = (await git.listRemotes({ ...config ? config : await this.addIsomorphicGitConfigFS() })).map((remote) => { return { name: remote.remote, url: remote.url } }
      )
    } catch (e) {
      // do nothing
    }
    return remotes
  }

  async branch(cmd: branchInputType): Promise<void> {

    let status
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      status = await this.call('isogit', 'branch', cmd)
    } else {
      status = await git.branch({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd
      })
    }
    if (cmd.refresh) {
      setTimeout(async () => {
        await this.call('fileManager', 'refresh')
      }, 1000)
    }
    this.emit('branch')
    return status
  }

  async currentbranch(config: currentBranchInput): Promise<branch> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'currentbranch')
    }

    try {
      const defaultConfig = await this.addIsomorphicGitConfigFS()
      const cmd = config ? defaultConfig ? { ...defaultConfig, ...config } : config : defaultConfig
      const name = await git.currentBranch(cmd)
      let remote: remote = undefined
      try {
        const remoteName = await git.getConfig({
          ...defaultConfig,
          path: `branch.${name}.remote`
        })
        if (remoteName) {
          const remoteUrl = await git.getConfig({
            ...defaultConfig,
            path: `remote.${remoteName}.url`
          })
          remote = { name: remoteName, url: remoteUrl }
        }

      } catch (e) {
        // do nothing
      }

      return {
        remote: remote,
        name: name || ''
      }
    } catch (e) {
      return undefined
    }
  }

  async branches(config): Promise<branch[]> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'branches')
    }

    try {
      const defaultConfig = await this.addIsomorphicGitConfigFS()
      const cmd = config ? defaultConfig ? { ...defaultConfig, ...config } : config : defaultConfig
      const remotes = await this.remotes(config)
      let branches: branch[] = []
      branches = (await git.listBranches(cmd)).map((branch) => { return { remote: undefined, name: branch } })
      for (const remote of remotes) {
        cmd.remote = remote.name
        const remotebranches = (await git.listBranches(cmd)).map((branch) => { return { remote: remote, name: branch } })
        branches = [...branches, ...remotebranches]
      }
      return branches
    } catch (e) {
      console.log(e)
      return []
    }
  }

  async commit(cmd: commitInput): Promise<string> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      try {
        await this.call('isogit', 'init')
        const sha = await this.call('isogit', 'commit', cmd)
        this.emit('commit')
        return sha
      } catch (e) {
        throw new Error(e)
      }
    } else {

      await this.init()
      try {
        const sha = await git.commit({
          ...await this.addIsomorphicGitConfigFS(),
          ...cmd
        })
        this.emit('commit')
        return sha
      } catch (e) {
        throw new Error(e)
      }
    }
  }

  async lsfiles(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'lsfiles', cmd)
    }

    const filesInStaging = await git.listFiles({
      ...await this.addIsomorphicGitConfigFS(),
      ...cmd
    })
    return filesInStaging
  }

  async resolveref(cmd: resolveRefInput): Promise<string> {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'resolveref', cmd)
    }

    const oid = await git.resolveRef({
      ...await this.addIsomorphicGitConfigFS(),
      ...cmd
    })
    return oid
  }

  async readblob(cmd: readBlobInput): Promise<ReadBlobResult> {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const readBlobResult = await this.call('isogit', 'readblob', cmd)
      return readBlobResult
    }
    const readBlobResult = await git.readBlob({
      ...await this.addIsomorphicGitConfigFS(),
      ...cmd
    })

    return readBlobResult
  }

  async setIpfsConfig(config) {
    this.ipfsconfig = config
    return new Promise((resolve) => {
      resolve(this.checkIpfsConfig())
    })
  }

  async checkIpfsConfig(config?) {
    this.ipfs = IpfsHttpClient(config || this.ipfsconfig)
    try {
      await this.ipfs.config.getAll()
      return true
    } catch (e) {
      return false
    }
  }

  async addremote(input: remote): Promise<void> {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'addremote', { url: input.url, remote: input.name })
      return
    }
    await git.addRemote({ ...await this.addIsomorphicGitConfigFS(), url: input.url, remote: input.name })
  }

  async delremote(input: remote) {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'delremote', { remote: input.name })
      return
    }
    await git.deleteRemote({ ...await this.addIsomorphicGitConfigFS(), remote: input.name })
  }

  async localStorageUsed() {
    return this.calculateLocalStorage()
  }

  async clone(input: cloneInputType) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const folder = await this.call('fs', 'selectFolder', null, 'Select or create a folder to clone the repository in', 'Select as Repository Destination')
      if (!folder) return false
      const cmd = {
        url: input.url,
        singleBranch: input.singleBranch,
        ref: input.branch,
        depth: input.depth || 10,
        dir: folder,
        input
      }
      this.call('terminal', 'logHtml', `Cloning ${input.url}... please wait...`)
      try {
        const result = await this.call('isogit', 'clone', cmd)
        this.call('fs', 'openWindow', folder)
        return result
      } catch (e) {
        this.call('notification', 'alert', {
          id: 'dgitAlert',
          message: 'Unexpected error while cloning the repository: \n' + e.toString(),
        })
      }
    } else {
      const permission = await this.askUserPermission('clone', 'Import multiple files into your workspaces.')
      if (!permission) return false
      if (parseFloat(this.calculateLocalStorage()) > 10000) throw new Error('The local storage of the browser is full.')
      if (!input.workspaceExists) await this.call('filePanel', 'createWorkspace', input.workspaceName || `workspace_${Date.now()}`, true)
      const cmd = {
        url: input.url,
        singleBranch: input.singleBranch,
        ref: input.branch,
        depth: input.depth || 10,
        ...await this.addIsomorphicGitConfig(input),
        ...await this.addIsomorphicGitConfigFS()
      }
      this.call('terminal', 'logHtml', `Cloning ${input.url}... please wait...`)
      const result = await git.clone(cmd)
      if (!input.workspaceExists) {
        setTimeout(async () => {
          await this.call('fileManager', 'refresh')
        }, 1000)
      }
      this.emit('clone')
      this.call('fileManager', 'hasGitSubmodules').then((submodules) => {
        if (submodules) {
          this.call('terminal', 'log', { type: 'warn', value: 'This repository has submodules. Please update submodules to pull all the dependencies.' })
          this.emit('repositoryWithSubmodulesCloned')
        }
      })
      return result
    }
  }

  async parseGitmodules(dir = '') {
    try {
      const gitmodules = await this.call('fileManager', 'readFile', path.join(dir, '.gitmodules'))
      if (gitmodules) {
        const lines = gitmodules.split('\n')
        let currentModule: any = {}
        const modules = []
        for (let line of lines) {
          line = line.trim()
          if (line.startsWith('[')) {
            if (currentModule.path) {
              modules.push(currentModule)
            }
            currentModule = {}
            currentModule.name = line.replace('[submodule "', '').replace('"]', '')
          } else if (line.startsWith('url')) {
            currentModule.url = line.replace('url = ', '')
          } else if (line.startsWith('path')) {
            currentModule.path = line.replace('path = ', '')
          }
        }
        if (currentModule.path) {
          modules.push(currentModule)
        }
        return modules
      }
    } catch (e) {
      // do nothing
    }
  }

  async updateSubmodules(input) {
    try {
      const currentDir = (input && input.dir) || ''
      const gitmodules = await this.parseGitmodules(currentDir)
      this.call('terminal', 'logHtml', `Found ${(gitmodules && gitmodules.length) || 0} submodules in ${currentDir || '/'}`)
      //parse gitmodules
      if (gitmodules) {
        for (const module of gitmodules) {
          const dir = path.join(currentDir, module.path)
          const targetPath = (await this.addIsomorphicGitConfigFS(dir)).dir
          if (await window.remixFileSystem.exists(targetPath)) {
            const stat = await window.remixFileSystem.stat(targetPath)
            try {
              if (stat.isDirectory()) {
                await window.remixFileSystem.unlink(targetPath)
              }
            } catch (e) {
              // do nothing
            }
          }
        }
        for (const module of gitmodules) {
          const dir = path.join(currentDir, module.path)
          // if url contains git@github.com: convert it
          if (module.url && module.url.startsWith('git@github.com:')) {
            module.url = module.url.replace('git@github.com:', 'https://github.com/')
          }
          try {
            const cmd = {
              url: module.url,
              singleBranch: true,
              depth: 1,
              ...await this.addIsomorphicGitConfig({
                ...input,
                provider: 'github'
              }),
              ...await this.addIsomorphicGitConfigFS(dir)
            }
            this.call('terminal', 'logHtml', `Cloning submodule ${dir}...`)
            await git.clone(cmd)
            this.call('terminal', 'logHtml', `Cloned successfully submodule ${dir}...`)

            const commitHash = await git.resolveRef({
              ...await this.addIsomorphicGitConfigFS(currentDir),
              ref: 'HEAD'
            })

            const result = await git.walk({
              ...await this.addIsomorphicGitConfigFS(currentDir),
              trees: [git.TREE({ ref: commitHash })],
              map: async function (filepath, [A]) {
                if (filepath === module.path) {
                  return await A.oid()
                }
              }
            })
            if (result && result.length) {
              this.call('terminal', 'logHtml', `Checking out submodule ${dir} to ${result[0]} in directory ${dir}`)
              await git.fetch({
                ...await this.addIsomorphicGitConfig({
                  ...input,
                  provider: 'github'
                }),
                ...await this.addIsomorphicGitConfigFS(dir),
                singleBranch: true,
                ref: result[0]
              })

              await git.checkout({
                ...await this.addIsomorphicGitConfigFS(dir),
                ref: result[0]
              })

              const log = await git.log({
                ...await this.addIsomorphicGitConfigFS(dir),
              })

              if (log[0].oid !== result[0]) {
                this.call('terminal', 'log', {
                  type: 'error',
                  value: `Could not checkout submodule to ${result[0]}`
                })
              } else {
                this.call('terminal', 'logHtml', `Checked out submodule ${dir} to ${result[0]}`)
              }
            }

            await this.updateSubmodules({
              ...input,
              dir
            })
          } catch (e) {
            this.call('terminal', 'log', { type: 'error', value: `[Cloning]: Error occurred! ${e}` })
            console.log(e)
          }
        }

        setTimeout(async () => {
          await this.call('fileManager', 'refresh')
        }, 1000)
      }
    } catch (e) {
      this.call('terminal', 'log', { type: 'error', value: `[Cloning]: Error occurred! ${e}` })
      // do nothing
    }
  }

  async push(input: pushInputType) {

    const cmd = {
      force: input.force,
      ref: input.ref.name,
      remoteRef: input.remoteRef && input.remoteRef.name,
      remote: input.remote.name,
      author: await this.getCommandUser(input),
      input,
    }
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'push', cmd)
    } else {

      const cmd2 = {
        ...cmd,
        ...await this.addIsomorphicGitConfig(input),
      }

      const result = await git.push({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd2
      })

      return result

    }
  }

  async pull(input: pullInputType) {

    const cmd = {
      ref: input.ref.name,
      remoteRef: input.remoteRef && input.remoteRef.name,
      author: await this.getCommandUser(input),
      remote: input.remote.name,
      input,
    }
    let result
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      result = await this.call('isogit', 'pull', cmd)
    }
    else {
      const cmd2 = {
        ...cmd,
        ...await this.addIsomorphicGitConfig(input),
      }
      result = await git.pull({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd2
      })
    }
    setTimeout(async () => {
      await this.call('fileManager', 'refresh')
    }, 1000)
    return result
  }

  async fetch(input: fetchInputType) {
    const cmd = {
      ref: input.ref && input.ref.name,
      remoteRef: input.remoteRef && input.remoteRef.name,
      author: await this.getCommandUser(input),
      remote: input.remote && input.remote.name,
      depth: input.depth || 5,
      singleBranch: input.singleBranch,
      relative: input.relative,
      input
    }

    let result
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      result = await this.call('isogit', 'fetch', cmd)
    } else {
      const cmd2 = {
        ...cmd,
        ...await this.addIsomorphicGitConfig(input),
      }
      result = await git.fetch({
        ...await this.addIsomorphicGitConfigFS(),
        ...cmd2
      })

    }

    setTimeout(async () => {
      await this.call('fileManager', 'refresh')
    }, 1000)
    return result
  }

  async export(config) {
    if (!this.checkIpfsConfig(config)) return false
    const workspace = await this.call('filePanel', 'getCurrentWorkspace')
    const files = await this.getDirectory('/')
    this.filesToSend = []
    for (const file of files) {
      const c = await window.remixFileSystem.readFile(`${workspace.absolutePath}/${file}`, null)
      const ob = {
        path: file,
        content: c
      }
      this.filesToSend.push(ob)
    }
    const addOptions = {
      wrapWithDirectory: true
    }
    const r = await this.ipfs.add(this.filesToSend, addOptions)
    return r.cid.string
  }

  async importIPFSFiles(config, cid, workspace) {
    const ipfs = IpfsHttpClient(config)
    let result = false
    try {
      const data = ipfs.get(cid, { timeout: 60000 })
      for await (const file of data) {
        if (file.path) result = true
        file.path = file.path.replace(cid, '')
        if (!file.content) {
          continue
        }
        const content = []
        for await (const chunk of file.content) {
          content.push(chunk)
        }
        const dir = path.dirname(file.path)
        try {
          await this.createDirectories(`${workspace.absolutePath}/${dir}`)
        } catch (e) { throw new Error(e) }
        try {
          await window.remixFileSystem.writeFile(`${workspace.absolutePath}/${file.path}`, Buffer.concat(content) || new Uint8Array(), null)
        } catch (e) { throw new Error(e) }
      }
    } catch (e) {
      throw new Error(e)
    }
    return result
  }

  calculateLocalStorage() {
    let _lsTotal = 0
    let _xLen; let _x
    for (_x in localStorage) {
      // eslint-disable-next-line no-prototype-builtins
      if (!localStorage.hasOwnProperty(_x)) {
        continue
      }
      _xLen = ((localStorage[_x].length + _x.length) * 2)
      _lsTotal += _xLen
    }
    return (_lsTotal / 1024).toFixed(2)
  }

  async import(cmd) {
    const permission = await this.askUserPermission('import', 'Import multiple files into your workspaces.')
    if (!permission) return false
    if (parseFloat(this.calculateLocalStorage()) > 10000) throw new Error('The local storage of the browser is full.')
    const cid = cmd.cid
    await this.call('filePanel', 'createWorkspace', `workspace_${Date.now()}`, true)
    const workspace = await this.call('filePanel', 'getCurrentWorkspace')
    let result
    if (cmd.local) {
      result = await this.importIPFSFiles(this.ipfsconfig, cid, workspace)
    } else {
      result = await this.importIPFSFiles(this.remixIPFS, cid, workspace) || await this.importIPFSFiles(this.ipfsconfig, cid, workspace) || await this.importIPFSFiles(this.globalIPFSConfig, cid, workspace)
    }
    setTimeout(async () => {
      await this.call('fileManager', 'refresh')
    }, 1000)
    if (!result) throw new Error(`Cannot pull files from IPFS at ${cid}`)
  }

  async getItem(name) {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(name)
    }
  }

  async setItem(name, content) {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(name, content)
      }
    } catch (e) {
      console.log(e)
      return false
    }
    return true
  }

  async zip() {
    const zip = new JSZip()
    const workspace = await this.call('filePanel', 'getCurrentWorkspace')
    const files = await this.getDirectory('/')
    this.filesToSend = []
    for (const file of files) {
      const c = await window.remixFileSystem.readFile(`${workspace.absolutePath}/${file}`, null)
      zip.file(file, c)
    }
    await zip.generateAsync({
      type: 'blob'
    })
      .then(function (content) {
        saveAs(content, `${workspace.name}.zip`)
      })
  }

  async createDirectories(strdirectories) {
    const ignore = ['.', '/.', '']
    if (ignore.indexOf(strdirectories) > -1) return false
    const directories = strdirectories.split('/')
    for (let i = 0; i < directories.length; i++) {
      let previouspath = ''
      if (i > 0) previouspath = '/' + directories.slice(0, i).join('/')
      const finalPath = previouspath + '/' + directories[i]
      try {
        if (!await window.remixFileSystem.exists(finalPath)) {
          await window.remixFileSystem.mkdir(finalPath)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  async getDirectory(dir) {
    let result = []
    const files = await this.call('fileManager', 'readdir', dir)
    const fileArray = normalize(files)
    for (const fi of fileArray) {
      if (fi) {
        const type = fi.data.isDirectory
        if (type === true) {
          result = [
            ...result,
            ...(await this.getDirectory(
              `${fi.filename}`
            ))
          ]
        } else {
          result = [...result, fi.filename]
        }
      }
    }
    return result
  }

  // OCTOKIT FEATURES

  async remotebranches(input: { owner: string, repo: string, token: string, page: number, per_page: number }) {

    const octokit = new Octokit({
      auth: input.token
    })

    const data = await octokit.request('GET /repos/{owner}/{repo}/branches{?protected,per_page,page}', {
      owner: input.owner,
      repo: input.repo,
      per_page: input.per_page || 100,
      page: input.page || 1
    })

    return data.data
  }

  async getGitHubUser(input: { token: string }): Promise<{
    user: GitHubUser,
    emails: userEmails,
    scopes: string[]
  }> {
    try {
      const octokit = new Octokit({
        auth: input.token
      })

      const user = await octokit.request('GET /user', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      const emails = await octokit.request('GET /user/emails')

      const scopes = user.headers['x-oauth-scopes'] || ''

      return {
        user: {
          ...user.data, isConnected:
            user.data.login !== undefined && user.data.login !== null && user.data.login !== ''
        },
        emails: emails.data,
        scopes: scopes && scopes.split(',').map(scope => scope.trim())
      }
    } catch (e) {
      return null
    }
  }

  async remotecommits(input: remoteCommitsInputType): Promise<pagedCommits[]> {
    const octokit = new Octokit({
      auth: input.token
    })
    input.length = input.length || 5
    input.page = input.page || 1
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: input.owner,
      repo: input.repo,
      sha: input.branch,
      per_page: input.length,
      page: input.page
    })
    const pages: pagedCommits[] = []
    const readCommitResults: ReadCommitResult[] = []
    for (const githubApiCommit of response.data) {
      const readCommitResult = {
        oid: githubApiCommit.sha,
        commit: {
          author: {
            name: githubApiCommit.commit.author.name,
            email: githubApiCommit.commit.author.email,
            timestamp: new Date(githubApiCommit.commit.author.date).getTime() / 1000,
            timezoneOffset: new Date(githubApiCommit.commit.author.date).getTimezoneOffset()
          },
          committer: {
            name: githubApiCommit.commit.committer.name,
            email: githubApiCommit.commit.committer.email,
            timestamp: new Date(githubApiCommit.commit.committer.date).getTime() / 1000,
            timezoneOffset: new Date(githubApiCommit.commit.committer.date).getTimezoneOffset()
          },
          message: githubApiCommit.commit.message,
          tree: githubApiCommit.commit.tree.sha,
          parent: githubApiCommit.parents.map(parent => parent.sha)
        },
        payload: '' // You may need to reconstruct the commit object in Git's format if necessary
      }
      readCommitResults.push(readCommitResult)
    }

    // Check for the Link header to determine pagination
    const linkHeader = response.headers.link;

    let hasNextPage = false;
    if (linkHeader) {
      // A simple check for the presence of a 'next' relation in the Link header
      hasNextPage = linkHeader.includes('rel="next"');
    }

    pages.push({
      page: input.page,
      perPage: input.length,
      total: response.data.length,
      hasNextPage: hasNextPage,
      commits: readCommitResults
    })
    return pages
  }

  async repositories(input: repositoriesInput) {

    const accessToken = input.token;

    const page = input.page || 1
    const perPage = input.per_page || 10

    const baseURL = 'https://api.github.com/user/repos'
    const repositories = []
    const sort = 'updated'
    const direction = 'desc'

    const headers = {
      'Authorization': `Bearer ${accessToken}`, // Include your GitHub access token
      'Accept': 'application/vnd.github.v3+json', // GitHub API v3 media type
    };

    const url = `${baseURL}?visibility=private,public&page=${page}&per_page=${perPage}&sort=${sort}&direction=${direction}`;
    const response = await axios.get(url, { headers });

    repositories.push(...response.data);

    return repositories
  }

}

const addSlash = (file) => {
  if (!file.startsWith('/')) file = '/' + file
  return file
}

const normalize = (filesList) => {
  const folders = []
  const files = []
  Object.keys(filesList || {}).forEach(key => {
    if (filesList[key].isDirectory) {
      folders.push({
        filename: key,
        data: filesList[key]
      })
    } else {
      files.push({
        filename: key,
        data: filesList[key]
      })
    }
  })
  return [...folders, ...files]
}

module.exports = DGitProvider
