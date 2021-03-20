'use strict'

import {
  Plugin
} from '@remixproject/engine'
import git from 'isomorphic-git'
import IpfsHttpClient from 'ipfs-http-client'
import { saveAs } from 'file-saver'
const JSZip = require('jszip')
const path = require('path')

const profile = {
  name: 'dGitProvider',
  displayName: 'Decentralized git',
  description: '',
  icon: 'assets/img/fileManager.webp',
  version: '0.0.1',
  methods: ['init', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pull', 'setIpfsConfig', 'zip'],
  kind: 'file-system'
}
class DGitProvider extends Plugin {
  constructor (fileManager) {
    super(profile)
    this.fileManager = fileManager
    this.ipfsconfig = {
      host: 'ipfs.komputing.org',
      port: 443,
      protocol: 'https',
      ipfsurl: 'https://ipfsgw.komputing.org/ipfs/'
    }
  }

  async getGitConfig () {
    const workspace = await this.call('fileExplorers', 'getCurrentWorkspace')
    return {
      fs: window.remixFileSystem,
      dir: `.workspaces/${workspace.name}`
    }
  }

  async init () {
    await git.init({
      ...await this.getGitConfig(),
      defaultBranch: 'main'
    })
  }

  async status (cmd) {
    const status = await git.statusMatrix({
      ...await this.getGitConfig(),
      ...cmd
    })
    return status
  }

  async add (cmd) {
    await git.add({
      ...await this.getGitConfig(),
      ...cmd
    })
  }

  async rm (cmd) {
    await git.remove({
      ...await this.getGitConfig(),
      ...cmd
    })
  }

  async checkout (cmd) {
    await git.checkout({
      ...await this.getGitConfig(),
      ...cmd
    })
    await this.call('fileManager', 'refresh')
  }

  async log (cmd) {
    const status = await git.log({
      ...await this.getGitConfig(),
      ...cmd
    })
    return status
  }

  async branch (cmd) {
    const status = await git.branch({
      ...await this.getGitConfig(),
      ...cmd
    })
    return status
  }

  async currentbranch () {
    const name = await git.currentBranch({
      ...await this.getGitConfig()
    })
    return name
  }

  async branches () {
    const branches = await git.listBranches({
      ...await this.getGitConfig()
    })
    return branches
  }

  async commit (cmd) {
    await this.init()
    try {
      const sha = await git.commit({
        ...await this.getGitConfig(),
        ...cmd
      })
      await this.call('fileManager', 'refresh')
      return sha
    } catch (e) {
    }
  }

  async lsfiles (cmd) {
    const filesInStaging = await git.listFiles({
      ...await this.getGitConfig(),
      ...cmd
    })
    return filesInStaging
  }

  async resolveref (cmd) {
    const oid = await git.resolveRef({
      ...await this.getGitConfig(),
      ...cmd
    })
    return oid
  }

  async readblob (cmd) {
    const readBlobResult = await git.readBlob({
      ...await this.getGitConfig(),
      ...cmd
    })
    return readBlobResult
  }

  async setIpfsConfig (config) {
    this.ipfsconfig = config
    return new Promise((resolve, reject) => {
      resolve(this.checkIpfsConfig())
    })
  }

  async checkIpfsConfig () {
    this.ipfs = IpfsHttpClient(this.ipfsconfig)
    try {
      await this.ipfs.config.getAll()
      return true
    } catch (e) {
      return false
    }
  }

  async push () {
    if (!this.checkIpfsConfig()) return false
    const workspace = await this.call('fileExplorers', 'getCurrentWorkspace')
    const files = await this.getDirectory('/')
    this.filesToSend = []
    for (const file of files) {
      const c = window.remixFileSystem.readFileSync(`.workspaces/${workspace.name}/${file}`)
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

  async pull (cmd) {
    const cid = cmd.cid
    if (!this.checkIpfsConfig()) return false
    await this.call('fileExplorers', 'createWorkspace', `workspace_${Date.now()}`, false)
    const workspace = await this.call('fileExplorers', 'getCurrentWorkspace')
    for await (const file of this.ipfs.get(cid)) {
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
        this.createDirectories(`.workspaces/${workspace.name}${dir}`)
      } catch (e) {}
      try {
        window.remixFileSystem.writeFileSync(`.workspaces/${workspace.name}/${file.path}`, content[0] || new Uint8Array())
      } catch (e) {}
    }
    await this.call('fileManager', 'refresh')
  }

  async zip () {
    const zip = new JSZip()
    const workspace = await this.call('fileExplorers', 'getCurrentWorkspace')
    const files = await this.getDirectory('/')
    this.filesToSend = []
    for (const file of files) {
      const c = window.remixFileSystem.readFileSync(`.workspaces/${workspace.name}/${file}`)
      zip.file(file, c)
    }
    await zip.generateAsync({ type: 'blob' })
      .then(function (content) {
        saveAs(content, `${workspace.name}.zip`)
      })
  }

  async createDirectories (strdirectories) {
    const ignore = ['.', '/.', '']
    if (ignore.indexOf(strdirectories) > -1) return false
    const directories = strdirectories.split('/')
    for (let i = 0; i < directories.length; i++) {
      let previouspath = ''
      if (i > 0) previouspath = '/' + directories.slice(0, i).join('/')
      const finalPath = previouspath + '/' + directories[i]
      try {
        window.remixFileSystem.mkdirSync(finalPath)
      } catch (e) {}
    }
  }

  async getDirectory (dir) {
    let result = []
    const files = await this.fileManager.readdir(dir)
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
