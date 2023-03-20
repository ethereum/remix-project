import { NightwatchBrowser } from 'nightwatch'

require('dotenv').config()

type LoadPlugin = {
  name: string
  url: string
}

export default function (browser: NightwatchBrowser, callback: VoidFunction, url?: string, preloadPlugins = true, loadPlugin?: LoadPlugin, hideToolTips: boolean = true): void {
  browser
    .url(url || 'http://127.0.0.1:8080')
    //.switchBrowserTab(0)
    .waitForElementVisible('[id="remixTourSkipbtn"]')
    .click('[id="remixTourSkipbtn"]')

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
    .perform(() => {
      if (hideToolTips) {
        browser.execute(function () { // hide tooltips
          function addStyle(styleString) {
            const style = document.createElement('style');
            style.textContent = styleString;
            document.head.append(style);
          }

          addStyle(`
            .bs-popover-right {
              display:none !important;
            }
            .bs-popover-top {
              display:none !important;
            }
            .bs-popover-left {
              display:none !important;
            }
            .bs-popover-bottom {
              display:none !important;
            }
          `);
        })
      }
      if (preloadPlugins) {
        initModules(browser, () => {
          browser

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
