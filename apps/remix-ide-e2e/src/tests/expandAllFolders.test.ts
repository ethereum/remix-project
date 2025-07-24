'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should expand all folders in the file explorer': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .expandAllFolders()
      .pause(2000)
      .isVisible({
        selector: '*[data-id="treeViewLitreeViewItemcontracts"] .fa-folder-open',
        timeout: 5000,
        suppressNotFoundErrors: true
      })
      .isVisible({
        selector: '*[data-id="treeViewLitreeViewItemscripts"] .fa-folder-open',
        timeout: 5000,
        suppressNotFoundErrors: true
      })
  },

  'Should expand all folders within a specific directory': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .addFile('package.json', sources[0]['package.json'])
      .addFile('Untitled10.sol', sources[0]['Untitled10.sol'])
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem.deps"]')
      .expandAllFolders()
      .pause(5000)
  }
}
const sources = [
  {
    'Untitled10.sol': { content: 'pragma solidity ^0.8.0; import "@module_remapping/token/ERC20/ERC20.sol"; contract test15 {}' },
    'package.json': { content: `{
    "dependencies": {
      "@module_remapping": "npm:@openzeppelin/contracts@^4.9.0"
  }
}` }
  }
]
