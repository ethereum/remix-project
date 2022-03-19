import React from 'react' // eslint-disable-line
import { RunTabUI } from '@remix-ui/run-tab'
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'

const EventManager = require('../../lib/events')
const Recorder = require('../tabs/runTab/model/recorder.js')
const _paq = window._paq = window._paq || []

const profile = {
  name: 'udapp',
  displayName: 'Deploy & run transactions',
  icon: 'assets/img/deployAndRun.webp',
  description: 'execute and save transactions',
  kind: 'udapp',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/run.html',
  version: packageJson.version,
  permission: true,
  events: ['newTransaction'],
  methods: ['createVMAccount', 'sendTransaction', 'getAccounts', 'pendingTransactionsCount', 'getSettings', 'setEnvironmentMode', 'clearAllInstances', 'addInstance']
}

export class RunTab extends ViewPlugin {
  constructor (blockchain, config, fileManager, editor, filePanel, compilersArtefacts, networkModule, fileProvider) {
    super(profile)
    this.event = new EventManager()
    this.config = config
    this.blockchain = blockchain
    this.fileManager = fileManager
    this.editor = editor
    this.filePanel = filePanel
    this.compilersArtefacts = compilersArtefacts
    this.networkModule = networkModule
    this.fileProvider = fileProvider
    this.recorder = new Recorder(blockchain)
    this.REACT_API = {}
    this.setupEvents()
    this.el = document.createElement('div')
  }

  setupEvents () {
    this.blockchain.events.on('newTransaction', (tx, receipt) => {
      this.emit('newTransaction', tx, receipt)
    })
  }

  getSettings () {
    return new Promise((resolve, reject) => {
      resolve({
        selectedAccount: this.REACT_API.accounts.selectedAccount,
        selectedEnvMode: this.REACT_API.selectExEnv,
        networkEnvironment: this.REACT_API.networkName
      })
    })
  }

  async setEnvironmentMode (env) {
    const canCall = await this.askUserPermission('setEnvironmentMode', 'change the environment used')
    if (canCall) {
      env = typeof env === 'string' ? { context: env } : env
      this.emit('setEnvironmentModeReducer', env, this.currentRequest.from)
    }
  }

  clearAllInstances () {
    this.emit('clearAllInstancesReducer')
  }

  addInstance (address, abi, name) {    
    this.emit('addInstanceReducer', address, abi, name)
  }

  createVMAccount (newAccount) {
    return this.blockchain.createVMAccount(newAccount)
  }

  sendTransaction (tx) {
    _paq.push(['trackEvent', 'udapp', 'sendTx'])
    return this.blockchain.sendTransaction(tx)
  }

  getAccounts (cb) {
    return this.blockchain.getAccounts(cb)
  }

  pendingTransactionsCount () {
    return this.blockchain.pendingTransactionsCount()
  }

  render () {
    return  <div><RunTabUI plugin={this} /></div>
  }

  onReady (api) {
    this.REACT_API = api    
  }

  async onInitDone () {
    await this.call('manager', 'activatePlugin', 'hardhat-provider')
    await this.call('manager', 'activatePlugin', 'ganache-provider')
  }

  writeFile (fileName, content) {
    return this.call('fileManager', 'writeFile', fileName, content)
  }

  readFile (fileName) {
    return this.call('fileManager', 'readFile', fileName)
  }
}
