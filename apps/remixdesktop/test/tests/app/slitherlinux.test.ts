import {NightwatchBrowser} from 'nightwatch'
import { ChildProcess, spawn } from 'child_process'
import { homedir } from 'os'
const tests = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
   done()
  },
  open: function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="openFolderButton"]', 10000).click('*[data-id="openFolderButton"]')
  },

  'open default template': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('button[data-id="landingPageImportFromTemplate"]')
      .click('button[data-id="landingPageImportFromTemplate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .pause(3000)
      .windowHandles(function (result) {
        console.log(result.value)
        browser.switchWindow(result.value[1])
        .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
        .click('*[data-id="treeViewLitreeViewItemtests"]')
        .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
        .click('*[data-id="treeViewLitreeViewItemcontracts"]')
        .waitForElementVisible('[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
        .openFile('contracts/1_Storage.sol')
        .waitForElementVisible('*[id="editorView"]', 10000)
        .getEditorValue((content) => {
          browser.assert.ok(content.includes('function retrieve() public view returns (uint256){'))
        })
      })
  },
  'Should install slither #group6': function (browser: NightwatchBrowser) {
    browser.perform(async (done) => {
      await installSlither()
      done()
    })
  },
  'run slither': function (browser: NightwatchBrowser) {
    browser
    .click('[data-id="verticalIconsKindpluginManager"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtonsolidityStaticAnalysis"]')
    .clickLaunchIcon('solidity').click('*[data-id="compilerContainerCompileBtn"]')
    .pause(1000)
    .clickLaunchIcon('solidityStaticAnalysis')
    .useXpath()
    .click('//*[@id="staticAnalysisRunBtn"]')
    .waitForElementPresent('//*[@id="staticanalysisresult"]', 5000)
    .waitForElementVisible({
      selector: "//*[@data-id='nolibslitherwarnings'][contains(text(), '1')]",
      locateStrategy: 'xpath',
      timeout: 5000
    })
    .waitForElementVisible({
      selector: "//div[@data-id='block']/span[contains(text(), '1 warnings found.')]",
      locateStrategy: 'xpath',
      timeout: 5000
    })
  },
  
  after: function (browser: NightwatchBrowser) {
    browser.end()
  },
}

async function installSlither(): Promise<void> {
    console.log('installSlither', process.cwd())
    try {
        const server = spawn('node', ['../../dist/libs/remixd/src/scripts/installSlither.js'], { cwd: process.cwd(), shell: true, detached: true })
        return new Promise((resolve, reject) => {
            server.stdout.on('data', function (data) {
                console.log(data.toString())
                if (
                    data.toString().includes("Slither is ready to use")
                ) {
                    console.log('resolving')
                    resolve()
                }
            })
            server.stderr.on('err', function (data) {
                console.log(data.toString())
                reject(data.toString())
            })
        })
    } catch (e) {
        console.log(e)
    }
  }

module.exports = {
    ...process.platform.startsWith('linux')?tests:{}
}