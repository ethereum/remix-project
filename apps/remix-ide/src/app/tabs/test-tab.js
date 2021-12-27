/* global */
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { SolidityUnitTesting } from '@remix-ui/solidity-unit-testing' // eslint-disable-line
import { TestTabLogic } from '@remix-ui/solidity-unit-testing' // eslint-disable-line

import { ViewPlugin } from '@remixproject/engine-web'
import helper from '../../lib/helper'
import { canUseWorker, urlFromVersion } from '@remix-project/remix-solidity'

// var tooltip = require('../ui/tooltip')
var Renderer = require('../ui/renderer')
var { UnitTestRunner, assertLibCode } = require('@remix-project/remix-tests')

const profile = {
  name: 'solidityUnitTesting',
  displayName: 'Solidity unit testing',
  methods: ['testFromPath', 'testFromSource', 'setTestFolderPath', 'getTestlibs'],
  events: [],
  icon: 'assets/img/unitTesting.webp',
  description: 'Fast tool to generate unit tests for your contracts',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/unittesting.html'
}

module.exports = class TestTab extends ViewPlugin {
  constructor (fileManager, offsetToLineColumnConverter, filePanel, compileTab, appManager, contentImport) {
    super(profile)
    this.compileTab = compileTab
    this.contentImport = contentImport
    this.fileManager = fileManager
    this.filePanel = filePanel
    this.appManager = appManager
    this.renderer = new Renderer(this)
    this.testRunner = new UnitTestRunner()
    this.testTabLogic = new TestTabLogic(this.fileManager, helper)
    this.offsetToLineColumnConverter = offsetToLineColumnConverter
    this.allFilesInvolved = ['.deps/remix-tests/remix_tests.sol', '.deps/remix-tests/remix_accounts.sol']
    this.element = document.createElement('div')
  }

  onActivationInternal () {
    this.listenToEvents()
    this.call('filePanel', 'registerContextMenuItem', {
      id: 'solidityUnitTesting',
      name: 'setTestFolderPath',
      label: 'Set path for Unit Testing',
      type: ['folder'],
      extension: [],
      path: [],
      pattern: []
    })
  }

  async setTestFolderPath (event) {
    if (event.path.length > 0) {
      this.renderComponent(event.path[0])
    }
  }

  getTestlibs () {
    return { assertLibCode, accountsLibCode: this.testRunner.accountsLibCode }
  }

  async createTestLibs () {
    const provider = await this.fileManager.currentFileProvider()
    if (provider) {
      provider.addExternal('.deps/remix-tests/remix_tests.sol', assertLibCode, 'remix_tests.sol')
      provider.addExternal('.deps/remix-tests/remix_accounts.sol', this.testRunner.accountsLibCode, 'remix_accounts.sol')
    }
  }

  async onActivation () {
    const isSolidityActive = await this.call('manager', 'isActive', 'solidity')
    if (!isSolidityActive) {
      await this.call('manager', 'activatePlugin', 'solidity')
    }
    await this.testRunner.init()
    await this.createTestLibs()
  }

  onDeactivation () {
    this.off('filePanel', 'newTestFileCreated')
    this.off('filePanel', 'setWorkspace')
    // 'currentFileChanged' event is added more than once
    this.fileManager.events.removeAllListeners('currentFileChanged')
  }

  listenToEvents () {
    this.on('filePanel', 'workspaceCreated', async () => {
      this.createTestLibs()
    })

    this.testRunner.event.on('compilationFinished', (success, data, source) => {
      if (success) {
        this.allFilesInvolved.push(...Object.keys(data.sources))
        // forwarding the event to the appManager infra
        // This is listened by compilerArtefacts to show data while debugging
        this.emit('compilationFinished', source.target, source, 'soljson', data)
      }
    })
  }

  async testFromPath (path) {
    const fileContent = await this.fileManager.readFile(path)
    return this.testFromSource(fileContent, path)
  }

  /*
    Test is not associated with the UI
  */
  testFromSource (content, path = 'browser/unit_test.sol') {
    return new Promise((resolve, reject) => {
      const runningTest = {}
      runningTest[path] = { content }
      const { currentVersion, evmVersion, optimize, runs } = this.compileTab.getCurrentCompilerConfig()
      const currentCompilerUrl = urlFromVersion(currentVersion)
      const compilerConfig = {
        currentCompilerUrl,
        evmVersion,
        optimize,
        usingWorker: canUseWorker(currentVersion),
        runs
      }
      this.testRunner.runTestSources(runningTest, compilerConfig, () => {}, () => {}, null, (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }, (url, cb) => {
        return this.contentImport.resolveAndSave(url).then((result) => cb(null, result)).catch((error) => cb(error.message))
      })
    })
  }

  render () {
    this.onActivationInternal()
    this.renderComponent()
    return this.element
  }

  renderComponent (testDirPath) {
    ReactDOM.render(
      <SolidityUnitTesting testTab={this} helper={helper} initialPath={testDirPath} />
      , this.element)
  }
}
