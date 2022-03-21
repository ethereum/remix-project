'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  'Should display settings menu ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('*[data-id="landingPageStartSolidity"]')
      .waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .click('*[data-id="verticalIconsKindsettings"]')
      .waitForElementContainsText('h6[data-id="sidePanelSwapitTitle"]', 'SETTINGS')
  },

  'Should activate `generate contract metadata` ': function (browser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]', 5000)
      .waitForElementVisible('*[data-id="settingsTabGenerateContractMetadataLabel"]', 5000)
      .verify.elementPresent('[data-id="settingsTabGenerateContractMetadata"]:checked')
      .click('*[data-id="verticalIconsKindfilePanel"]')
      .click('[data-id="treeViewLitreeViewItemcontracts"]')
      .openFile('contracts/3_Ballot.sol')
      .click('*[data-id="verticalIconsKindsolidity"]')
      .pause(2000)
      .click('*[data-id="compilerContainerCompileBtn"]')
      .pause(3000)
      .click('*[data-id="verticalIconsKindfilePanel"]')
      .openFile('contracts/artifacts/Ballot.json')
      .openFile('contracts/artifacts/Ballot_metadata.json')
      .getEditorValue((content) => {
        const metadata = JSON.parse(content)
        browser.assert.equal(metadata.language, 'Solidity')
      })
  },

  'Should add new github access token ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .click('*[data-id="verticalIconsKindsettings"]')
      .setValue('*[data-id="settingsTabGistAccessToken"]', '**********')
      .click('*[data-id="settingsTabSaveGistToken"]')
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 5000)
      .assert.containsText('*[data-shared="tooltipPopup"]', 'Access token has been saved')
      .pause(3000)
  },

  'Should copy github access token to clipboard ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .click('*[data-id="copyToClipboardCopyIcon"]')
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 5000)
      // .waitForElementVisible('*[data-shared="tooltipPopup"]:nth-last-of-type(1) , 5000)
      // .assert.containsText('*[data-shared="tooltipPopup"]', 'Copied value to clipboard.')
      // .assert.containsText('*[data-shared="tooltipPopup"]:nth-last-of-type(1)', 'Copied value to clipboard.')
  },

  'Should remove github access token ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .pause(1000)
      .click('*[data-id="settingsTabRemoveGistToken"]')
      .waitForElementVisible('*[data-shared="tooltipPopup"]', 5000)
      .assert.containsText('*[data-shared="tooltipPopup"]', 'Access token removed')
      .assert.containsText('*[data-id="settingsTabGistAccessToken"]', '')
  },

  'Should load dark theme ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .scrollAndClick('*[data-id="settingsTabThemeLabelDark"]')
      .pause(2000)
      .checkElementStyle(':root', '--primary', remixIdeThemes.dark.primary)
      .checkElementStyle(':root', '--secondary', remixIdeThemes.dark.secondary)
      .checkElementStyle(':root', '--success', remixIdeThemes.dark.success)
      .checkElementStyle(':root', '--info', remixIdeThemes.dark.info)
      .checkElementStyle(':root', '--warning', remixIdeThemes.dark.warning)
      .checkElementStyle(':root', '--danger', remixIdeThemes.dark.danger)
  },

  'Should load light theme ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .scrollAndClick('*[data-id="settingsTabThemeLabelLight"]')
      .pause(2000)
      .checkElementStyle(':root', '--primary', remixIdeThemes.light.primary)
      .checkElementStyle(':root', '--secondary', remixIdeThemes.light.secondary)
      .checkElementStyle(':root', '--success', remixIdeThemes.light.success)
      .checkElementStyle(':root', '--info', remixIdeThemes.light.info)
      .checkElementStyle(':root', '--warning', remixIdeThemes.light.warning)
      .checkElementStyle(':root', '--danger', remixIdeThemes.light.danger)
  },

  'Should load Cerulean theme ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .scrollAndClick('*[data-id="settingsTabThemeLabelCerulean"]')
      .pause(5000)
      .checkElementStyle(':root', '--primary', remixIdeThemes.curelean.primary)
      .checkElementStyle(':root', '--secondary', remixIdeThemes.curelean.secondary)
      .checkElementStyle(':root', '--success', remixIdeThemes.curelean.success)
      .checkElementStyle(':root', '--info', remixIdeThemes.curelean.info)
      .checkElementStyle(':root', '--warning', remixIdeThemes.curelean.warning)
      .checkElementStyle(':root', '--danger', remixIdeThemes.curelean.danger)
  },

  'Should load Flatly theme ': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .scrollAndClick('*[data-id="settingsTabThemeLabelFlatly"]')
      .pause(2000)
      .checkElementStyle(':root', '--primary', remixIdeThemes.flatly.primary)
      .checkElementStyle(':root', '--secondary', remixIdeThemes.flatly.secondary)
      .checkElementStyle(':root', '--success', remixIdeThemes.flatly.success)
      .checkElementStyle(':root', '--info', remixIdeThemes.flatly.info)
      .checkElementStyle(':root', '--warning', remixIdeThemes.flatly.warning)
      .checkElementStyle(':root', '--danger', remixIdeThemes.flatly.danger)
  },

  'Should load Spacelab theme ': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .scrollAndClick('*[data-id="settingsTabThemeLabelSpacelab"]')
      .pause(2000)
      .checkElementStyle(':root', '--primary', remixIdeThemes.spacelab.primary)
      .checkElementStyle(':root', '--secondary', remixIdeThemes.spacelab.secondary)
      .checkElementStyle(':root', '--success', remixIdeThemes.spacelab.success)
      .checkElementStyle(':root', '--info', remixIdeThemes.spacelab.info)
      .checkElementStyle(':root', '--warning', remixIdeThemes.spacelab.warning)
      .checkElementStyle(':root', '--danger', remixIdeThemes.spacelab.danger)
  },

  'Should load Cyborg theme ': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]', 5000)
      .scrollAndClick('*[data-id="settingsTabThemeLabelCyborg"]')
      .pause(2000)
      .checkElementStyle(':root', '--primary', remixIdeThemes.cyborg.primary)
      .checkElementStyle(':root', '--secondary', remixIdeThemes.cyborg.secondary)
      .checkElementStyle(':root', '--success', remixIdeThemes.cyborg.success)
      .checkElementStyle(':root', '--info', remixIdeThemes.cyborg.info)
      .checkElementStyle(':root', '--warning', remixIdeThemes.cyborg.warning)
      .checkElementStyle(':root', '--danger', remixIdeThemes.cyborg.danger)
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
  },
  curelean: {
    primary: '#2FA4E7',
    secondary: '#e9ecef',
    success: '#73A839',
    info: '#033C73',
    warning: '#DD5600',
    danger: '#C71C22'
  },
  flatly: {
    primary: '#2C3E50',
    secondary: '#95a5a6',
    success: '#18BC9C',
    info: '#3498DB',
    warning: '#F39C12',
    danger: '#E74C3C'
  },
  spacelab: {
    primary: '#446E9B',
    secondary: '#999',
    success: '#3CB521',
    info: '#3399F3',
    warning: '#D47500',
    danger: '#CD0200'
  },
  cyborg: {
    primary: '#2A9FD6',
    secondary: '#555',
    success: '#77B300',
    info: '#93C',
    warning: '#F80',
    danger: '#C00'
  }
}
