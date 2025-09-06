'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should display settings menu ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeIconPanel"]', 60000)
      .waitForElementVisible('*[data-id="topbar-settingsIcon"]')
      .click('*[data-id="topbar-settingsIcon"]')
      .waitForElementContainsText('[data-id="settings-sidebar-header"] h2', 'Settings', 60000)
  },

  'Should activate `generate contract metadata` ': function (browser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .waitForElementVisible('*[data-id="generate-contract-metadataSwitch"]')
      .verify.elementPresent('[data-id="generate-contract-metadataSwitch"] .fa-toggle-on')
      .openFile('contracts/3_Ballot.sol')
      .click('*[data-id="verticalIconsKindsolidity"]')
      .pause(2000)
      .click('*[data-id="compilerContainerCompileBtn"]')
      .pause(3000)
      .click('*[data-id="verticalIconsKindfilePanel"]')
      .openFile('artifacts/Ballot.json')
      .openFile('artifacts/Ballot_metadata.json')
      .getEditorValue((content) => {
        const metadata = JSON.parse(content)
        browser.assert.equal(metadata.language, 'Solidity')
      })
  },

  'Should add new github access token ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="topbar-settingsIcon"]')
      .click('*[data-id="topbar-settingsIcon"]')
      .waitForElementVisible('*[data-id="settings-sidebar-services"]')
      .click('*[data-id="settings-sidebar-services"]')
      .pause(100)
      .click('*[data-id="github-configSwitch"]')
      .setValue('[data-id="settingsTabgist-access-token"]', '**********')
      .click('[data-id="settingsTabSavegithub-config"]')
      .pause(100)
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 60000)
      .assert.containsText('*[data-shared="tooltipPopup"]', 'Credentials updated')
      .pause(3000)
  },

  'Should remove github access token ': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="github-configSwitch"]')
      .pause(500)
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 60000)
      .assert.containsText('*[data-shared="tooltipPopup"]', 'Credentials removed')
      .waitForElementNotPresent('[data-id="settingsTabgist-access-token"]')
      .click('*[data-id="github-configSwitch"]')
      .pause(100)
      .assert.containsText('[data-id="settingsTabgist-access-token"]', '')
  },
  // These e2e should be enabled after settings panel refactoring
  // 'Should load dark theme ': function (browser: NightwatchBrowser) {
  //   browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 60000)
  //     .scrollAndClick('*[data-id="settingsTabThemeLabelDark"]')
  //     .pause(2000)
  //     .checkElementStyle(':root', '--primary', remixIdeThemes.dark.primary)
  //     .checkElementStyle(':root', '--secondary', remixIdeThemes.dark.secondary)
  //     .checkElementStyle(':root', '--success', remixIdeThemes.dark.success)
  //     .checkElementStyle(':root', '--info', remixIdeThemes.dark.info)
  //     .checkElementStyle(':root', '--warning', remixIdeThemes.dark.warning)
  //     .checkElementStyle(':root', '--danger', remixIdeThemes.dark.danger)
  // },

  // 'Should load light theme ': function (browser: NightwatchBrowser) {
  //   browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 60000)
  //     .scrollAndClick('*[data-id="settingsTabThemeLabelLight"]')
  //     .pause(2000)
  //     .checkElementStyle(':root', '--primary', remixIdeThemes.light.primary)
  //     .checkElementStyle(':root', '--secondary', remixIdeThemes.light.secondary)
  //     .checkElementStyle(':root', '--success', remixIdeThemes.light.success)
  //     .checkElementStyle(':root', '--info', remixIdeThemes.light.info)
  //     .checkElementStyle(':root', '--warning', remixIdeThemes.light.warning)
  //     .checkElementStyle(':root', '--danger', remixIdeThemes.light.danger)
  // },



  'Should load zh locale ': function (browser) {
    browser.waitForElementVisible('*[data-id="settings-sidebar-general"]')
      .click('*[data-id="settings-sidebar-general"]')
      .pause(100)
      .scrollAndClick('*[data-id="settingsTabDropdownTogglelocale"]')
      .waitForElementVisible('[data-id="custom-dropdown-items"]')
      .waitForElementVisible('[data-id="settingsTabDropdownItemzh"]')
      .click('[data-id="settingsTabDropdownItemzh"]')
      .pause(2000)
      .assert.containsText('[data-id="settings-sidebar-header"] h2', '设置')
      .assert.containsText('*[data-id="listenNetworkCheckInput"]', '监听所有交易')
      .assert.containsText('*[data-id="settingsTabgenerate-contract-metadataLabel"]', '生成合约元数据')
      .assert.containsText('*[data-id="settingsTabauto-completionLabel"]', '在编辑器中启用代码自动补全')
      .assert.containsText('*[data-id="settingsTabshow-gasLabel"]', '在编辑器中展示 gas 预算')
      .assert.containsText('*[data-id="settingsTabdisplay-errorsLabel"]', '编辑代码时展示错误提示')
  },

  'Should load en locale ': function (browser) {
    browser.scrollAndClick('*[data-id="settingsTabDropdownTogglelocale"]')
      .waitForElementVisible('[data-id="custom-dropdown-items"]')
      .waitForElementVisible('[data-id="settingsTabDropdownItemen"]')
      .click('[data-id="settingsTabDropdownItemen"]')
      .pause(2000)
      .assert.containsText('[data-id="settings-sidebar-header"] h2', 'Settings')
      .assert.containsText('*[data-id="listenNetworkCheckInput"]', 'Listen on all transactions')
      .assert.containsText('*[data-id="settingsTabgenerate-contract-metadataLabel"]', 'Generate contract metadata')
      .assert.containsText('*[data-id="settingsTabauto-completionLabel"]', 'Enable code completion in editor')
      .assert.containsText('*[data-id="settingsTabshow-gasLabel"]', 'Display gas estimates in editor')
      .assert.containsText('*[data-id="settingsTabdisplay-errorsLabel"]', 'Display errors in editor while typing')
  }
}

const remixIdeThemes = {
  dark: {
    primary: '#007aa6',
    secondary: '#595c76',
    success: '#32ba89',
    info: '#086CB5',
    warning: '#c97539',
    danger: '#b84040'
  },
  light: {
    primary: '#007aa6',
    secondary: '#b3bcc483',
    success: '#32ba89',
    info: '#007aa6',
    warning: '#c97539',
    danger: '#b84040'
  }
}
