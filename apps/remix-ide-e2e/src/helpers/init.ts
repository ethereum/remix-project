/* eslint-disable prefer-rest-params */
import { NightwatchBrowser } from 'nightwatch'

require('dotenv').config()

type LoadPlugin = {
  name: string
  url: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (browser: NightwatchBrowser, callback: VoidFunction, url?: string, preloadPlugins = true, loadPlugin?: LoadPlugin, hideToolTips: boolean = true): void {
  browser
    .url(url || 'http://127.0.0.1:8080')
    .pause(5000)
    .switchBrowserTab(0)
    .hidePopupPanel()
    .perform((done) => {
      if (!loadPlugin) return done()
      browser
        .pause(5000)
        .execute(function (loadPlugin) { // override a plugin url for testing purpose
          localStorage.setItem('test-plugin-name', loadPlugin.name)
          localStorage.setItem('test-plugin-url', loadPlugin.url)
        }, [loadPlugin])
        .refreshPage()
        .perform(done())
    })
    .verifyLoad()
    .enableClipBoard()
    .perform((done) => {
      browser.execute(function () { // hide tooltips
        function addStyle(styleString) {
          const style = document.createElement('style');
          style.textContent = styleString;
          document.head.append(style);
        }

        addStyle(`
          .popover {
            display:none !important;
          }
          #scamDetails {
            display:none !important;
          }
          `);
      }, [], done())
    })
    .perform(() => {
      browser.execute(function () {
        (window as any).logs = [];
        (console as any).browserLog = console.log;
        (console as any).browserError = console.error
        console.log = function () {
          try {
            (window as any).logs.push(JSON.stringify(arguments))
          } catch (e) {
            (window as any).logs.push(e.message)
          }
          try {
            (console as any).browserLog(...arguments)
          } catch (e) {
            (console as any).browserLog(e.message)
          }
        }
        console.error = function () {
          try {
            (window as any).logs.push(JSON.stringify(arguments))
          } catch (e) {
            (window as any).logs.push(e.message)
          }
          try {
            (console as any).browserError(...arguments)
          } catch (e) {
            (console as any).browserError(e.message)
          }
        }
      })
    })
    .perform(() => {
      if (preloadPlugins) {
        initModules(browser, () => {
          browser
            .pause(4000)
            .clickLaunchIcon('solidity')
            .waitForElementVisible('[for="autoCompile"]')
            .click('[for="autoCompile"]')
            .verify.elementPresent('[data-id="compilerContainerAutoCompile"]:checked')
            .perform(() => { callback() })
        })
      } else {
        callback()
      }
    })
}

function initModules(browser: NightwatchBrowser, callback: VoidFunction) {
  browser
    .click('[data-id="verticalIconsKindpluginManager"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtonsolidityStaticAnalysis"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtondebugger"]')
    .scrollAndClick('[data-id="verticalIconsKindfilePanel"]')
    .clickLaunchIcon('settings')
    .click('*[data-id="settingsTabGenerateContractMetadataLabel"]')
    .setValue('[data-id="settingsTabGistAccessToken"]', process.env.gist_token)
    .click('[data-id="settingsTabSaveGistToken"]')
    .click('[data-id="settingsTabThemeLabelFlatly"]') // e2e tests were initially developed with Flatly. Some tests are failing with the default one (Dark), because the dark theme put uppercase everywhere.
    .perform(() => { callback() })
}
