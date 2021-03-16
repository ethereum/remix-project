'use strict'

import { Plugin } from '@remixproject/engine'
import git from 'isomorphic-git'

const profile = {
  name: 'dGitProvider',
  displayName: 'Decentralized git',
  description: '',
  icon: 'assets/img/fileManager.webp',
  permission: true,
  version: '0.0.1',
  methods: ['init', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'lsfiles'],
  kind: 'file-system'
}
class DGitProvider extends Plugin {
  constructor () {
    super(profile)
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
    await git.init({ ...await this.getGitConfig() })
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

  async log (ref = 'HEAD') {
    console.log('git log')
    const status = await git.log({
      ...await this.getGitConfig(),
      ref: ref
    })
    console.log('log', status)
    return status
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
}
module.exports = DGitProvider
