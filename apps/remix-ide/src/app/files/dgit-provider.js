'use strict'

import { Plugin } from '@remixproject/engine'
import git from 'isomorphic-git'
import IpfsHttpClient from 'ipfs-http-client'

const profile = {
  name: 'dGitProvider',
  displayName: 'Decentralized git',
  description: '',
  icon: 'assets/img/fileManager.webp',
  permission: true,
  version: '0.0.1',
  methods: ['init', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pull'],
  kind: 'file-system'
}
class DGitProvider extends Plugin {
  constructor (fileManager) {
    super(profile)
    this.fileManager = fileManager
    this.ipfsconfig = {
      host: 'localhost',
      port: 5001,
      protocol: 'http',
      ipfsurl: 'https://ipfsgw.komputing.org/ipfs/'
    }
  }

  async getGitConfig () {
    const workspacename = await this.call('fileExplorers', 'getCurrentWorkspace')
    return new Promise((resolve, reject) => {
      resolve({
        fs: window.remixFileSystem,
        dir: `.workspaces/${workspacename}`
      })
    })
  }

  async init () {
    console.log('git init')
    await git.init({ ...await this.getGitConfig(), defaultBranch: 'main' })
  }

  async status (ref = 'HEAD') {
    console.log('git status')
    const status = await git.statusMatrix({
      ...await this.getGitConfig(),
      ref: ref
    })
    console.log('status', status)
    return status
  }

  async add (fileName) {
    console.log('add ', fileName)
    await git.add({
      ...await this.getGitConfig(),
      filepath: `${fileName}`
    })
  }

  async rm (fileName) {
    console.log('remove ', fileName)
    await git.remove({
      ...await this.getGitConfig(),
      filepath: `${fileName}`
    })
  }

  async checkout (ref) {
    console.log('git checkout', ref)
    const status = await git.checkout({
      ...await this.getGitConfig(),
      ref: ref
    })
    return status
  }

  async log (ref = 'HEAD') {
    console.log('git log')
    const status = await git.log({
      ...await this.getGitConfig(),
      ref: ref
    })
    console.log('log', status)
    return status
  }

  async branch (name) {
    console.log('git branch')
    const status = await git.branch({
      ...await this.getGitConfig(),
      ref: name
    })
    return status
  }

  async currentbranch () {
    console.log('git current branch')
    const name = await git.currentBranch({
      ...await this.getGitConfig()
    })
    console.log(name)
    return name
  }

  async branches () {
    console.log('git branches')
    const branches = await git.listBranches({
      ...await this.getGitConfig()
    })
    console.log('branches', branches)
    return branches
  }

  async commit (author, message) {
    console.log('git commit', author, message)
    try {
      const sha = await git.commit({
        ...await this.getGitConfig(),
        message: message,
        author: author
      })
      console.log('commit ', sha)
      return sha
    } catch (e) {
      console.log(e)
    }
  }

  async lsfiles (ref = 'HEAD') {
    const filesInStaging = await git.listFiles({
      ...await this.getGitConfig(),
      ref: ref
    })
    return filesInStaging
  }

  async resolveref (ref = 'HEAD') {
    const oid = await git.resolveRef({
      ...await this.getGitConfig(),
      ref: ref
    })
    return oid
  }

  async readblob (oid, filepath) {
    const readBlobResult = await git.readBlob({
      ...await this.getGitConfig(),
      oid: oid,
      filepath: filepath
    })
    return readBlobResult
  }

  async config (config) {
    this.ipfsconfig = config
  }

  async push () {
    const workspacename = await this.call('fileExplorers', 'getCurrentWorkspace')
    const ipfs = IpfsHttpClient(this.ipfsconfig)
    const files = await this.getDirectory('/')
    console.log(files)
    this.filesToSend = []
    for (const file of files) {
      const c = window.remixFileSystem.readFileSync(`.workspaces/${workspacename}/${file}`)
      console.log(`.workspaces/${workspacename}/${file}`, c)
      const ob = {
        path: file,
        content: c
      }
      this.filesToSend.push(ob)
    }
    console.log(this.filesToSend)
    const addOptions = {
      wrapWithDirectory: true
    }
    const r = await ipfs.add(this.filesToSend, addOptions)
    console.log(r)
    return r
  }

  async pull (cid) {
    const ipfs = IpfsHttpClient(this.ipfsconfig)
    const getDirName = require('path').dirname
    const workspacename = await this.call('fileExplorers', 'getCurrentWorkspace')
    for await (const file of ipfs.get(cid)) {
      file.path = file.path.replace(cid, '')
      if (!file.content) {
        continue
      }
      console.log(file.content)
      const content = []
      for await (const chunk of file.content) {
        content.push(chunk)
      }
      console.log(file.path, getDirName(file.path), content[0])
      const dir = getDirName(file.path)
      try {
        console.log('create dir', `.workspaces/${workspacename}${dir}`)
        this.createDirectories(`.workspaces/${workspacename}${dir}`)
      } catch (e) {}
      try {
        window.remixFileSystem.writeFileSync(`.workspaces/${workspacename}/${file.path}`, content[0] || new Uint8Array())
      } catch (e) {}
    }
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
      } catch (e) {
      }
    }
  }

  async getDirectory (dir, onlyDirectories = false) {
    let result = []
    const files = await this.fileManager.readdir(dir)
    const fileArray = normalize(files)
    for (let i = 0; i < fileArray.length; i++) {
      const fi = fileArray[i]
      if (typeof fi !== 'undefined') {
        const type = fi.data.isDirectory
        if (type === true) {
          if (onlyDirectories === true) result = [...result, fi.filename]
          result = [
            ...result,
            ...(await this.getDirectory(
              `${fi.filename}`,
              onlyDirectories
            ))
          ]
        } else {
          if (onlyDirectories === false) result = [...result, fi.filename]
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
