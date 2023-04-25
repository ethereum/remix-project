'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?activate=solidity,udapp&call=fileManager//open//contracts/3_Ballot.sol&deactivate=home', false)
  },

  CheckSolidityActivatedAndUDapp: function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('#icon-panel', 10000)
      .clickLaunchIcon('solidity')
      .clickLaunchIcon('udapp')
  },

  'Editor should be focused on the 3_Ballot.sol #group1': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .refreshPage()
      .waitForElementVisible('#editorView', 30000)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('contract Ballot {') !== -1, 'content includes Ballot contract')
      })
  },

  'Home page should be deactivated #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementNotPresent('[data-id="landingPageHomeContainer"]')
  },

  // WORKSPACE TEMPLATES E2E START

  'Should create Remix default workspace with files #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_remix_default' })
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(1000)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './web3-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './ethers-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'web3.eth.getAccounts')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'ethers.providers')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests/storage.test.js"]')
      .click('*[data-id="treeViewLitreeViewItemtests/storage.test.js"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'chai')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`const { expect } = require("chai");`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests/Ballot_test.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemREADME.txt"]')
  },

  'Should create blank workspace with no files #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_blank' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=blank]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementPresent('*[data-id="treeViewUltreeViewMenu"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem.prettierrc.json"]')
      .execute(function () {
        const fileList = document.querySelector('*[data-id="treeViewUltreeViewMenu"]')
        return fileList.getElementsByTagName('li').length;
      }, [], function (result) {
        browser.assert.equal(result.value, 1, 'Incorrect number of files');
      });
  },

  'Should create ERC20 workspace with files #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc20' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc20]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './web3-lib')]",
        locateStrategy: 'xpath',
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './ethers-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'web3.eth.getAccounts')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'ethers.providers')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests/MyToken_test.sol"]')
  },

  'Should create ERC721 workspace with files #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc721' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc721]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './web3-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './ethers-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'web3.eth.getAccounts')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'ethers.providers')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests/MyToken_test.sol"]')
  },

  'Should create ERC1155 workspace with files #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc1155' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc1155]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './web3-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './ethers-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'web3.eth.getAccounts')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'ethers.providers')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests/MyToken_test.sol"]')
  },

  'Should create ERC1155 workspace with template customizations #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc1155]')
      .waitForElementPresent('*[data-id="ozCustomization"]')
      .click('*[data-id="featureTypeMintable"]')
      .click('*[data-id="featureTypeBurnable"]')
      .click('*[data-id="featureTypePausable"]')
      .click('*[data-id="upgradeTypeUups"]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .click('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .pause(1000)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`contract MyToken is Initializable, ERC1155Upgradeable, OwnableUpgradeable, PausableUpgradeable, ERC1155BurnableUpgradeable, UUPSUpgradeable {`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './web3-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, './ethers-lib')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
          'Incorrect content')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'web3.eth.getAccounts')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
          'Incorrect content')
        browser.assert.ok(content.indexOf(`gas: gas || 3600000`) !== -1,
          'Incorrect gas cost')
      })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'ethers.providers')]",
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
          'Incorrect content')
      })
    // No test file is added in upgradeable contract template
  },

  // WORKSPACE TEMPLATES E2E END

  'Should create two workspace and switch to the first one #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .click('*[data-id="fileSystemModalDialogContainer-react"] input[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="fileSystemModalDialogContainer-react"] input[data-id="modalDialogCustomPromptTextCreate"]', 'workspace_name')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .addFile('test.sol', { content: 'test' })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .waitForElementPresent({
        selector: "//div[contains(@class, 'view-line') and contains(.//span, 'test')]",
        locateStrategy: 'xpath'
      })
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .click('*[data-id="fileSystemModalDialogContainer-react"] input[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="fileSystemModalDialogContainer-react"] input[data-id="modalDialogCustomPromptTextCreate"]', 'workspace_name_1')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .switchWorkspace('workspace_name')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .currentWorkspaceIs('workspace_name')
  },

  'Should rename a workspace #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementPresent('*[data-id="workspaceDropdownMenuIcon"]')
      .click('*[data-id="workspaceDropdownMenuIcon"]')
      .waitForElementVisible('*[data-id="wsdropdownMenu"]')
      .click('*[data-id="workspacerename"]') // rename workspace_name
      .useCss()
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextRename"]')
      .click('*[data-id="modalDialogCustomPromptTextRename"]')
      .clearValue('*[data-id="modalDialogCustomPromptTextRename"]')
      .setValue('*[data-id="modalDialogCustomPromptTextRename"]', 'workspace_name_renamed')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .pause(2000)
      .switchWorkspace('workspace_name_1')
      .pause(2000)
      .currentWorkspaceIs('workspace_name_1')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .switchWorkspace('workspace_name_renamed')
      .pause(2000)
      .currentWorkspaceIs('workspace_name_renamed')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest.sol"]')
  },

  'Should delete a workspace #group1': function (browser: NightwatchBrowser) {
    browser
      .switchWorkspace('workspace_name_1')
      .click('*[data-id="workspaceDropdownMenuIcon"]')
      .waitForElementVisible('*[data-id="wsdropdownMenu"]')
      .click('*[data-id="workspacedelete"]') // delete workspace_name_1
      .waitForElementVisible('*[data-id="fileSystemModalDialogModalFooter-react"]')
      .click('*[data-id="fileSystem-modal-footer-ok-react"]')
      .waitForElementVisible('*[data-id="workspacesSelect"]')
      .click('*[data-id="workspacesSelect"]')
      .waitForElementNotPresent(`[data-id="dropdown-item-workspace_name_1"]`)
      .end()
  },

  'Should create workspace for test #group2': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc1155]')
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'sometestworkspace' })
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem.prettierrc.json"]')
      .pause(2000)
  },

  'Should change the current workspace in localstorage to a non existant value, reload the page and see the workspace created #group2': function (browser: NightwatchBrowser) {
    browser
      .execute(function () {
        localStorage.setItem('currentWorkspace', 'non_existing_workspace')
      })
      .refreshPage()
      .clickLaunchIcon('filePanel')
      .currentWorkspaceIs('sometestworkspace')
  },

  'Should create workspace for next test #group2': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc1155]')
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_db_test' })
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem.prettierrc.json"]')
      .pause(2000)
  },

  'Should clear indexedDB and reload the page and see the default workspace #group2': function (browser: NightwatchBrowser) {
    browser
      .execute(function () {
        indexedDB.deleteDatabase('RemixFileSystem')
      })
      .refreshPage()
      .clickLaunchIcon('filePanel')
      .currentWorkspaceIs('default_workspace')

  },

  tearDown: sauce
}

