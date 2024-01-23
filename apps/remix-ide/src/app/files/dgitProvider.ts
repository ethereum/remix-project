'use strict'

import {
  Plugin
} from '@remixproject/engine'
import git from 'isomorphic-git'
import { create, IPFSHTTPClient } from 'kubo-rpc-client'
import {
  saveAs
} from 'file-saver'
import http from 'isomorphic-git/http/web'

import JSZip from 'jszip'
import path from 'path'
import FormData from 'form-data'
import axios from 'axios'
import {Registry} from '@remix-project/remix-lib'

const profile = {
  name: 'dGitProvider',
  displayName: 'Decentralized git',
  description: 'Decentralized git provider',
  icon: 'assets/img/fileManager.webp',
  version: '0.0.1',
  methods: ['init', 'localStorageUsed', 'addremote', 'delremote', 'remotes', 'fetch', 'clone', 'export', 'import', 'status', 'log', 'commit', 'add', 'remove', 'reset', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pin', 'pull', 'pinList', 'unPin', 'setIpfsConfig', 'zip', 'setItem', 'getItem', 'version', 'updateSubmodules'],
  kind: 'file-system'
}
class DGitProvider extends Plugin {
  ipfsconfig: { host: string; port: number; protocol: string; ipfsurl: string }
  globalIPFSConfig: { host: string; port: number; protocol: string; ipfsurl: string }
  remixIPFS: { host: string; port: number; protocol: string; ipfsurl: string }
  ipfsSources: any[]
  ipfs: IPFSHTTPClient
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

  async getGitConfig(dir = '') {

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

  async parseInput(input) {
    return {
      corsProxy: 'https://corsproxy.remixproject.org/',
      http,
      onAuth: url => {
        url
        const auth = {
          username: input.token,
          password: ''
        }
        return auth
      }
    }
  }

  async init(input?) {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'init', {
        defaultBranch: (input && input.branch) || 'main'
      })
      this.emit('init')
      return
    }

    await git.init({
      ...await this.getGitConfig(),
      defaultBranch: (input && input.branch) || 'main'
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

  async status(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const status = await this.call('isogit', 'status', cmd)

      return status
    }


    const status = await git.statusMatrix({
      ...await this.getGitConfig(),
      ...cmd
    })

    return status
  }

  async add(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'add', cmd)
    } else {
      await git.add({
        ...await this.getGitConfig(),
        ...cmd
      })
    }

    this.emit('add')
  }

  async rm(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'rm', cmd)
    } else {
      await git.remove({
        ...await this.getGitConfig(),
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
        ...await this.getGitConfig(),
        ...cmd
      })
      this.emit('rm')

    }
  }

  async checkout(cmd, refresh = true) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'checkout', cmd)
    } else {
      const gitmodules = await this.parseGitmodules() || []
      await git.checkout({
        ...await this.getGitConfig(),
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
        const path = (await this.getGitConfig(module.path)).dir
        if (await window.remixFileSystem.exists(path)) {
          const stat = await window.remixFileSystem.stat(path)
          try {
            if (stat.isDirectory()) {
              await window.remixFileSystem.unlink((await this.getGitConfig(module.path)).dir)
            }
          } catch (e) {
            // do nothing
          }
        }
      }
    }
    if (refresh) {
      setTimeout(async () => {
        await this.call('fileManager', 'refresh')
      }, 1000)
    }

    this.emit('checkout')
  }

  async log(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const status = await this.call('isogit', 'log', {
        ...cmd,
        depth: 10
      })

      return status
    }


    const status = await git.log({
      ...await this.getGitConfig(),
      ...cmd,
      depth: 10
    })
    return status
  }

  async remotes(config) {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'remotes', config)
    }

    let remotes = []
    try {
      remotes = await git.listRemotes({ ...config ? config : await this.getGitConfig() })
    } catch (e) {
      // do nothing
    }
    return remotes
  }

  async branch(cmd, refresh = true) {

    let status
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      status = await this.call('isogit', 'branch', cmd)
    } else {
      status = await git.branch({
        ...await this.getGitConfig(),
        ...cmd
      })
    }
    if (refresh) {
      setTimeout(async () => {
        await this.call('fileManager', 'refresh')
      }, 1000)
    }
    this.emit('branch')
    return status
  }

  async currentbranch(config) {



    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'currentbranch')
    }

    try {
      const defaultConfig = await this.getGitConfig()
      const cmd = config ? defaultConfig ? { ...defaultConfig, ...config } : config : defaultConfig
      const name = await git.currentBranch(cmd)

      return name
    } catch (e) {
      return ''
    }
  }

  async branches(config) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'branches')
    }

    try {
      const defaultConfig = await this.getGitConfig()
      const cmd = config ? defaultConfig ? { ...defaultConfig, ...config } : config : defaultConfig
      const remotes = await this.remotes(config)
      let branches = []
      branches = (await git.listBranches(cmd)).map((branch) => { return { remote: undefined, name: branch } })
      for (const remote of remotes) {
        cmd.remote = remote.remote
        const remotebranches = (await git.listBranches(cmd)).map((branch) => { return { remote: remote.remote, name: branch } })
        branches = [...branches, ...remotebranches]
      }
      return branches
    } catch (e) {
      return []
    }
  }

  async commit(cmd) {

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
          ...await this.getGitConfig(),
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
      ...await this.getGitConfig(),
      ...cmd
    })
    return filesInStaging
  }

  async resolveref(cmd) {

    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'resolveref', cmd)
    }

    const oid = await git.resolveRef({
      ...await this.getGitConfig(),
      ...cmd
    })
    return oid
  }

  async readblob(cmd) {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      const readBlobResult = await this.call('isogit', 'readblob', cmd)
      return readBlobResult
    }
    const readBlobResult = await git.readBlob({
      ...await this.getGitConfig(),
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
    this.ipfs = create(config || this.ipfsconfig)
    try {
      await this.ipfs.config.getAll()
      return true
    } catch (e) {
      return false
    }
  }

  async addremote(input) {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'addremote', { url: input.url, remote: input.remote })
      return
    }
    await git.addRemote({ ...await this.getGitConfig(), url: input.url, remote: input.remote })
  }

  async delremote(input) {
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      await this.call('isogit', 'delremote', { remote: input.remote })
      return
    }
    await git.deleteRemote({ ...await this.getGitConfig(), remote: input.remote })
  }

  async localStorageUsed() {
    return this.calculateLocalStorage()
  }

  async clone(input, workspaceName, workspaceExists = false) {

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
      try{
        const result = await this.call('isogit', 'clone', cmd)
        this.call('fs', 'openWindow', folder)
        return result
      }catch(e){
        this.call('notification', 'alert', {
          id: 'dgitAlert',
          message: 'Unexpected error while cloning the repository: \n' + e.toString(),
        })
      }
    } else {
      const permission = await this.askUserPermission('clone', 'Import multiple files into your workspaces.')
      if (!permission) return false
      if (parseFloat(this.calculateLocalStorage()) > 10000) throw new Error('The local storage of the browser is full.')
      if (!workspaceExists) await this.call('filePanel', 'createWorkspace', workspaceName || `workspace_${Date.now()}`, true)
      const cmd = {
        url: input.url,
        singleBranch: input.singleBranch,
        ref: input.branch,
        depth: input.depth || 10,
        ...await this.parseInput(input),
        ...await this.getGitConfig()
      }
      this.call('terminal', 'logHtml', `Cloning ${input.url}...`)
      const result = await git.clone(cmd)
      if (!workspaceExists) {
        setTimeout(async () => {
          await this.call('fileManager', 'refresh')
        }, 1000)
      }
      this.emit('clone')
      return result
    }
  }

  async parseGitmodules (dir = '') {
    try {
      const gitmodules = await this.call('fileManager', 'readFile', path.join(dir, '.gitmodules'))
      if (gitmodules) {
        const lines = gitmodules.split('\n')
        let currentModule:any = {}
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
          const targetPath = (await this.getGitConfig(dir)).dir
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
          if(module.url && module.url.startsWith('git@github.com:')) {
            module.url = module.url.replace('git@github.com:', 'https://github.com/')
          }
          try {
            const cmd = {
              url: module.url,
              singleBranch: true,
              depth: 1,
              ...await this.parseInput(input),
              ...await this.getGitConfig(dir)
            }
            this.call('terminal', 'logHtml', `Cloning submodule ${dir}...`)
            await git.clone(cmd)
            this.call('terminal', 'logHtml', `Cloned successfully submodule ${dir}...`)
            
            const commitHash = await git.resolveRef({
              ...await this.getGitConfig(currentDir),
              ref: 'HEAD'
            })

            const result = await git.walk({
              ...await this.getGitConfig(currentDir),
              trees: [git.TREE({ ref: commitHash })],
              map: async function (filepath, [A]) {
                if(filepath === module.path) {
                  return await A.oid()
                }
              }
            })
            if(result && result.length) {
              this.call('terminal', 'logHtml', `Checking out submodule ${dir} to ${result[0]} in directory ${dir}`)
              await git.fetch({
                ...await this.parseInput(input),
                ...await this.getGitConfig(dir),
                singleBranch: true,
                ref: result[0]
              })

              await git.checkout({
                ...await this.getGitConfig(dir),
                ref: result[0]
              })
              
              const log = await git.log({
                ...await this.getGitConfig(dir),
              })

              if(log[0].oid !== result[0]) {
                this.call('terminal', 'log', {
                  type: 'error',
                  value: `Could not checkout submodule to ${result[0]}`
                })} else {              
                this.call('terminal', 'logHtml',`Checked out submodule ${dir} to ${result[0]}`)
              }
            }

            await this.updateSubmodules({
              ...input,
              dir
            })
          } catch (e) {
            this.call('terminal', 'log', { type: 'error', value: `[Cloning]: Error occured! ${e}` })
            console.log(e)
          }
        }

        setTimeout(async () => {
          await this.call('fileManager', 'refresh')
        }, 1000)
      }
    } catch (e) {
      this.call('terminal', 'log', { type: 'error', value: `[Cloning]: Error occured! ${e}` })
      // do nothing
    }
  }

  async push(input) {
    const cmd = {
      force: input.force,
      ref: input.ref,
      remoteRef: input.remoteRef,
      remote: input.remote,
      author: {
        name: input.name,
        email: input.email
      },
      input,
    }
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      return await this.call('isogit', 'push', cmd)
    } else {

      const cmd2 = {
        ...cmd,
        ...await this.parseInput(input),
      }
      return await git.push({
        ...await this.getGitConfig(),
        ...cmd2
      })

    }
  }

  async pull(input) {
    const cmd = {
      ref: input.ref,
      remoteRef: input.remoteRef,
      author: {
        name: input.name,
        email: input.email
      },
      remote: input.remote,
      input,
    }
    let result
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      result = await this.call('isogit', 'pull', cmd)
    }
    else {
      const cmd2 = {
        ...cmd,
        ...await this.parseInput(input),
      }
      result = await git.pull({
        ...await this.getGitConfig(),
        ...cmd2
      })
    }
    setTimeout(async () => {
      await this.call('fileManager', 'refresh')
    }, 1000)
    return result
  }

  async fetch(input) {
    const cmd = {
      ref: input.ref,
      remoteRef: input.remoteRef,
      author: {
        name: input.name,
        email: input.email
      },
      remote: input.remote,
      input
    }
    let result
    if ((Registry.getInstance().get('platform').api.isDesktop())) {
      result = await this.call('isogit', 'fetch', cmd)
    } else {
      const cmd2 = {
        ...cmd,
        ...await this.parseInput(input),
      }
      result = await git.fetch({
        ...await this.getGitConfig(),
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
      const c = await window.remixFileSystem.readFile(`${workspace.absolutePath}/${file}`)
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
    return r.cid.toString()
  }

  async pin(pinataApiKey, pinataSecretApiKey) {
    const workspace = await this.call('filePanel', 'getCurrentWorkspace')
    const files = await this.getDirectory('/')
    this.filesToSend = []

    const data = new FormData()
    for (const file of files) {
      const c = await window.remixFileSystem.readFile(`${workspace.absolutePath}/${file}`)
      data.append('file', new Blob([c]), `base/${file}`)
    }
    // get last commit data
    let ob
    try {
      const commits = await this.log({ ref: 'HEAD' })
      ob = {
        ref: commits[0].oid,
        message: commits[0].commit.message,
        commits: JSON.stringify(commits.map((commit) => {
          return {
            oid: commit.oid,
            commit: {
              parent: commit.commit?.parent,
              tree: commit.commit?.tree,
              message: commit.commit?.message,
              committer: {
                timestamp: commit.commit?.committer?.timestamp
              }
            }
          }
        }))
      }
    } catch (e) {
      ob = {
        ref: 'no commits',
        message: 'no commits'
      }
    }
    const today = new Date()
    const metadata = JSON.stringify({
      name: `remix - ${workspace.name} - ${today.toLocaleString()}`,
      keyvalues: ob
    })
    const pinataOptions = JSON.stringify({
      wrapWithDirectory: false
    })
    data.append('pinataOptions', pinataOptions)
    data.append('pinataMetadata', metadata)
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    try {
      const result = await axios
        .post(url, data, {
          maxBodyLength: 'Infinity',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${(data as any)._boundary}`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        } as any).catch((e) => {
          console.log(e)
        })
      // also commit to remix IPFS for availability after pinning to Pinata
      return await this.export(this.remixIPFS) || (result as any).data.IpfsHash
    } catch (error) {
      throw new Error(error)
    }
  }

  async pinList(pinataApiKey, pinataSecretApiKey) {
    const url = 'https://api.pinata.cloud/data/pinList?status=pinned'
    try {
      const result = await axios
        .get(url, {
          maxBodyLength: 'Infinity',
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        } as any).catch((e) => {
          console.log('Pinata unreachable')
        })
      return (result as any).data
    } catch (error) {
      throw new Error(error)
    }
  }

  async unPin(pinataApiKey, pinataSecretApiKey, hashToUnpin) {
    const url = `https://api.pinata.cloud/pinning/unpin/${hashToUnpin}`
    try {
      await axios
        .delete(url, {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        })
      return true
    } catch (error) {
      throw new Error(error)
    }
  }

  async importIPFSFiles(config, cid, workspace) {
    const ipfs: IPFSHTTPClient = create(config)
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
          await window.remixFileSystem.writeFile(`${workspace.absolutePath}/${file.path}`, Buffer.concat(content) || new Uint8Array())
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
      const c = await window.remixFileSystem.readFile(`${workspace.absolutePath}/${file}`)
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
