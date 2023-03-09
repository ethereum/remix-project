'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import { join } from 'path'
import { ChildProcess, spawn } from 'child_process'
import { writeFileSync } from 'fs'
import * as hardhatCompilation from '../helpers/hardhat_compilation_7839ba878952cc00ff316061405f273a.json'
import * as hardhat_compilation_Lock_dbg from '../helpers/hardhat_compilation_Lock.dbg.json'
import * as hardhat_compilation_Lock from '../helpers/hardhat_compilation_Lock.json'

import * as foundryCompilation from '../helpers/foundry_compilation.json'
import * as truffle_compilation from '../helpers/truffle_compilation.json'
import kill from 'tree-kill'

let remixd: ChildProcess
const assetsTestContract = `import "./contract.sol";
contract Assets {
    uint[] proposals;
    function add(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
`

const gmbhTestContract = `contract gmbh {
    uint[] proposals;
    function register(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
`
const sources = [
  {
    'localhost/folder1/contract2.sol': { content: 'contract test2 { function get () public returns (uint) { return 11; }}' }
  },
  {
    'localhost/src/gmbh/company.sol': { content: assetsTestContract }
  },
  {
    'localhost/src/gmbh/company.sol': { content: assetsTestContract },
    'localhost/src/gmbh/contract.sol': { content: gmbhTestContract }
  },
  {
    'test_import_node_modules.sol': { content: 'import "openzeppelin-solidity/contracts/math/SafeMath.sol";' }
  },
  {
    'test_import_node_modules_with_github_import.sol': { content: 'import "openzeppelin-solidity/contracts/sample.sol";' }
  },
  {
    'test_static_analysis_with_remixd_and_hardhat.sol': {
      content: `
      import "hardhat/console.sol";
      contract test5 { function get () public returns (uint) { return 8; }}`
    }
  }
]

module.exports = {
  '@disabled': true,
  before: function (browser, done) {
    init(browser, done)
  },
  after: function (browser) {
    browser.perform((done) => {
      console.log('remixd', remixd.pid)
      kill(remixd.pid)
      done()
    })
  },

  '@sources': function () {
    return sources
  },
  'run Remixd tests #group4': function (browser) {
    browser.perform(async (done) => {
      remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts'))
      console.log('working directory', process.cwd())
      connectRemixd(browser, done)
    })
      .perform((done) => {
        runTests(browser, done)
      })
  },
  'Import from node_modules #group1': function (browser) {
    /*
      when a relative import is used (i.e import "openzeppelin-solidity/contracts/math/SafeMath.sol")
      remix (as well as truffle) try to resolve it against the node_modules and installed_contracts folder.
    */
    browser.perform(async (done) => {
      remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts'))
      console.log('working directory', process.cwd())
      connectRemixd(browser, done)
    })
      .addFile('test_import_node_modules.sol', sources[3]['test_import_node_modules.sol'])
      .clickLaunchIcon('solidity')
      .setSolidityCompilerVersion('soljson-v0.5.0+commit.1d4f565a.js')
      .testContracts('test_import_node_modules.sol', sources[3]['test_import_node_modules.sol'], ['SafeMath'])
  },
  'Import from node_modules and reference a github import #group2': function (browser) {
    browser.perform(async (done) => {
      remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts'))
      console.log('working directory', process.cwd())
      connectRemixd(browser, done)
    })
      .addFile('test_import_node_modules_with_github_import.sol', sources[4]['test_import_node_modules_with_github_import.sol'])
      .clickLaunchIcon('solidity')
      .setSolidityCompilerVersion('soljson-v0.8.0+commit.c7dfd78e.js') // open-zeppelin moved to pragma ^0.8.0
      .testContracts('test_import_node_modules_with_github_import.sol', sources[4]['test_import_node_modules_with_github_import.sol'], ['ERC20', 'test11'])
  },
  'Static Analysis run with remixd #group3': '' + function (browser) {
    browser.testContracts('test_static_analysis_with_remixd_and_hardhat.sol', sources[5]['test_static_analysis_with_remixd_and_hardhat.sol'], ['test5']).pause(2000)
      .clickLaunchIcon('solidityStaticAnalysis')
    /*
    .click('#staticanalysisButton button').pause(4000)
    .waitForElementPresent('#staticanalysisresult .warning', 2000, true, function () {
      browser
        .waitForElementVisible('[data-id="staticAnalysisModuleMiscellaneous1Button"]')
        .click('[data-id="staticAnalysisModuleMiscellaneous1Button"]')
        .waitForElementVisible('.highlightLine16', 60000)
        .getEditorValue((content) => {
          browser.assert.ok(content.indexOf(
            'function _sendLogPayload(bytes memory payload) private view {') !== -1,
          'code has not been loaded')
        })
    })
    */
  },

  'Run git status': '' + function (browser) {
    browser
      .executeScriptInTerminal('git status')
      .pause(3000)
      .journalLastChildIncludes('On branch ')
  },

  'Close Remixd #group3': '' + function (browser) {
    browser
      .clickLaunchIcon('pluginManager')
      .scrollAndClick('#pluginManager *[data-id="pluginManagerComponentDeactivateButtonremixd"]')
  },

  'Should listen on compilation result from hardhat #group5': function (browser: NightwatchBrowser) {

    browser.perform(async (done) => {
      remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/hardhat'))
      console.log('working directory', process.cwd())
      connectRemixd(browser, done)
    })
      .perform((done) => {
        console.log('generating compilation result')
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/build-info/7839ba878952cc00ff316061405f273a.json', JSON.stringify(hardhatCompilation))
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.sol/Lock.json', JSON.stringify(hardhat_compilation_Lock))
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.sol/Lock.dbg.json', JSON.stringify(hardhat_compilation_Lock_dbg))
        done()
      })
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from Hardhat').before(60000)

    browser.clickLaunchIcon('filePanel')
      .openFile('contracts')
      .openFile('contracts/Lock.sol')
      .clickLaunchIcon('udapp')
      .selectContract('Lock')
      .createContract('1')
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('Unlock time should be in the future').before(60000)


  },

  'Should load compilation result from hardhat when remixd connects #group6': function (browser: NightwatchBrowser) {
    // artifacts/build-info/c7062fdd360381a85af23eeef31c98f8.json has already been created

    browser
      .perform((done) => {
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.sol/Lock.dbg.json', JSON.stringify(hardhat_compilation_Lock_dbg))
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.sol/Lock.json', JSON.stringify(hardhat_compilation_Lock))
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/build-info/7839ba878952cc00ff316061405f273a.json', JSON.stringify(hardhatCompilation))
        done()
      })
      .perform(async (done) => {
        remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/hardhat'))
        console.log('working directory', process.cwd())
        connectRemixd(browser, done)
      })
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from Hardhat').before(60000)

    browser.clickLaunchIcon('filePanel')
      .openFile('contracts')
      .openFile('contracts/Lock.sol')
      .clickLaunchIcon('udapp')
      .selectContract('Lock')
      .createContract('1')
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('Unlock time should be in the future').before(60000)


  },

  'Should listen on compilation result from foundry #group7': function (browser: NightwatchBrowser) {

    browser.perform(async (done) => {
      remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/foundry'))
      console.log('working directory', process.cwd())
      connectRemixd(browser, done)
    })
      .perform((done) => {
        writeFileSync('./apps/remix-ide/contracts/foundry/out/Counter.sol/Counter.json', JSON.stringify(foundryCompilation))
        done()
      })
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from Foundry').before(60000)

    let contractAaddress
    browser.clickLaunchIcon('filePanel')
      .openFile('src')
      .openFile('src/Counter.sol')
      .clickLaunchIcon('udapp')
      .selectContract('Counter')
      .createContract('')
      .getAddressAtPosition(0, (address) => {
        console.log(contractAaddress)
        contractAaddress = address
      })
      .clickInstance(0)
      .clickFunction('increment - transact (not payable)')
      .perform((done) => {
        browser.testConstantFunction(contractAaddress, 'number - call', null, '0:\nuint256: 1').perform(() => {
          done()
        })
      })


  },

  'Should listen on compilation result from truffle #group8': function (browser: NightwatchBrowser) {

    browser.perform(async (done) => {
      remixd = await spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/truffle'))
      console.log('working directory', process.cwd())
      connectRemixd(browser, done)
    })
      .perform((done) => {
        writeFileSync('./apps/remix-ide/contracts/truffle/build/contracts/Migrations.json', JSON.stringify(truffle_compilation))
        done()
      })
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from Truffle').before(60000)

    browser.clickLaunchIcon('filePanel')
      .openFile('contracts')
      .openFile('contracts/Migrations.sol')
      .clickLaunchIcon('udapp')
      .selectContract('Migrations')
      .createContract('')
      .testFunction('last',
        {
          status: 'true Transaction mined and execution succeed'
        })


  }
}

function runTests(browser: NightwatchBrowser, done: any) {
  const browserName = browser.options.desiredCapabilities.browserName
  browser.clickLaunchIcon('filePanel')
    .waitForElementVisible('[data-path="folder1"]')
    .click('[data-path="folder1"]')
    .waitForElementVisible('[data-path="contract1.sol"]')
    .assert.containsText('[data-path="contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="contract2.sol"]', 'contract2.sol')
    .waitForElementVisible('[data-path="folder1/contract1.sol"]')
    .assert.containsText('[data-path="folder1/contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="folder1/contract2.sol"]', 'contract2.sol') // load and test sub folder
    .click('[data-path="folder1/contract2.sol"]')
    .click('[data-path="folder1/contract1.sol"]') // open localhost/folder1/contract1.sol
    .pause(1000)
    .testEditorValue('contract test1 { function get () returns (uint) { return 10; }}') // check the content and replace by another
    .setEditorValue('contract test1Changed { function get () returns (uint) { return 10; }}')
    .testEditorValue('contract test1Changed { function get () returns (uint) { return 10; }}')
    .setEditorValue('contract test1 { function get () returns (uint) { return 10; }}')
    .click('[data-path="folder1/contract_' + browserName + '.sol"]') // rename a file and check
    .pause(1000)
    .renamePath('folder1/contract_' + browserName + '.sol', 'renamed_contract_' + browserName + '.sol', 'folder1/renamed_contract_' + browserName + '.sol')
    .pause(1000)
    .removeFile('folder1/contract_' + browserName + '_toremove.sol', 'localhost')
    .perform(function (done) {
      testImportFromRemixd(browser, () => { done() })
    })
    .clickLaunchIcon('filePanel')
    .waitForElementVisible('[data-path="folder1"]')
    .waitForElementVisible('[data-path="folder1/contract1.sol"]')
    .waitForElementVisible('[data-path="folder1/renamed_contract_' + browserName + '.sol"]') // check if renamed file is preset
    .waitForElementNotPresent('[data-path="folder1/contract_' + browserName + '.sol"]') // check if renamed (old) file is not present
    .waitForElementNotPresent('[data-path="folder1/contract_' + browserName + '_toremove.sol"]') // check if removed (old) file is not present
    .perform(done())
  // .click('[data-path="folder1/renamed_contract_' + browserName + '.sol"]')
}

function testImportFromRemixd(browser: NightwatchBrowser, callback: VoidFunction) {
  browser
    .waitForElementVisible('[data-path="src"]', 100000)
    .click('[data-path="src"]')
    .waitForElementVisible('[data-path="src/gmbh"]', 100000)
    .click('[data-path="src/gmbh"]')
    .waitForElementVisible('[data-path="src/gmbh/company.sol"]', 100000)
    .click('[data-path="src/gmbh/company.sol"]')
    .pause(1000)
    .verifyContracts(['Assets', 'gmbh'])
    .perform(() => { callback() })
}

async function spawnRemixd(path: string): Promise<ChildProcess> {
  const remixd = spawn('chmod +x dist/libs/remixd/src/bin/remixd.js && dist/libs/remixd/src/bin/remixd.js --remix-ide http://127.0.0.1:8080', [`-s ${path}`], { cwd: process.cwd(), shell: true, detached: true })
  return new Promise((resolve, reject) => {
    remixd.stdout.on('data', function (data) {
      if(
        data.toString().includes('is listening') 
        || data.toString().includes('There is already a client running')
        ) {
        
        resolve(remixd)
      }
    })
    remixd.stderr.on('err', function (data) {
      reject(data.toString())
    })
  })
}

function connectRemixd(browser: NightwatchBrowser, done: any) {
  const browserName = browser.options.desiredCapabilities.browserName
  if (browserName === 'safari' || browserName === 'internet explorer') {
    console.log('do not run remixd test for ' + browserName + ': sauce labs doesn\'t seems to handle websocket')
    browser.end()
    done()
    return
  }

  browser
    .pause(5000)
    .waitForElementVisible('#icon-panel', 2000)
    .clickLaunchIcon('filePanel')
    .clickLaunchIcon('pluginManager')
    .scrollAndClick('#pluginManager *[data-id="pluginManagerComponentActivateButtonremixd"]')
    .waitForElementVisible('*[data-id="remixdConnect-modal-footer-ok-react"]', 2000)
    .pause(2000)
    .click('*[data-id="remixdConnect-modal-footer-ok-react"]')
    .pause(5000)
    .perform(() => done())
}

