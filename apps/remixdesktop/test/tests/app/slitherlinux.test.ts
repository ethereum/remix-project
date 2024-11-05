import {NightwatchBrowser} from 'nightwatch'
import { ChildProcess, spawn, execSync } from 'child_process'
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
      .waitForElementPresent('*[data-id="create-remixDefault"]')
      .scrollAndClick('*[data-id="create-remixDefault"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementPresent('[data-id="TemplatesSelectionModalDialogContainer-react"] .modal-ok')
      .click('[data-id="TemplatesSelectionModalDialogContainer-react"] .modal-ok')
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
      try {
        const solcVersion = '0.8.15'
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: requires Python3.6+ (pip3) to be installed on your system`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc-select will be installed along with Slither to set different solc compiler versions.`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: checking pip3 availability ...`)
        const pip3OP = execSync('pip3 --version')
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: pip3 found: ${pip3OP.toString()}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: installing slither...`)
        const slitherOP = execSync('pip3 install slither-analyzer')
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: slither installation output: ${slitherOP.toString()}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: installing solc-select...`)
        const solcSelectOP = execSync('pip3 install solc-select')
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc-select installation output: ${solcSelectOP.toString()}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: installing solc ${solcVersion}...`)
        const solcInstallOP = execSync(`solc-select install ${solcVersion}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc installation output: ${solcInstallOP.toString()}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: setting solc version to ${solcVersion}...`)
        const solcUseOP = execSync(`solc-select use ${solcVersion}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc setting installation output: ${solcUseOP.toString()}`)
        console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: Slither is ready to use!`)
      } catch (err) {
        console.log('\x1b[31m%s\x1b[0m', `[Slither Installation]: Error occurred: ${err}`)
      }
    } catch (e) {
        console.log(e)
    }
  }




module.exports = {
    ...process.platform.startsWith('linux')?tests:{}
}