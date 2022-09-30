'use strict'
import { NightwatchBrowser } from 'nightwatch'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import init from '../helpers/init'
import * as hardhatCompilation from '../helpers/hardhat_compilation_14f7eb130f02e4d9abcd68528a373e96.json'
import * as hardhat_compilation_Lock_dbg from '../helpers/hardhat_compilation_Lock.dbg.json'
import * as hardhat_compilation_Lock from '../helpers/hardhat_compilation_Lock.json'

import * as foundryCompilation from '../helpers/foundry_compilation.json'
import * as truffle_compilation from '../helpers/truffle_compilation.json'


module.exports = {
  '@disabled': true,
  before: function (browser, done) {
    init(browser, done)
  },

  '@sources': function () {
    return []
  },
  
  'Should listen on compilation result from hardhat #group1': function (browser: NightwatchBrowser) {
    let remixd
    browser.perform((done) => {
      remixd = spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/hardhat'))
      console.log('working directory', process.cwd())
      startRemixd(browser, done)
    })
    .perform((done) => {
      console.log('generating compilation result')
      writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.dbg.json', JSON.stringify(hardhat_compilation_Lock_dbg))
      writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.json', JSON.stringify(hardhat_compilation_Lock))
      writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/build-info/14f7eb130f02e4d9abcd68528a373e96.json', JSON.stringify(hardhatCompilation))
      done()
    })
    .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from hardhat').before(60000)
      
    browser.clickLaunchIcon('udapp')
      .selectContract('Lock')
      .createContract('1')
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('Unlock time should be in the future').before(60000)

    browser.perform(() => {
      remixd.kill()
    })
   },

   'Should load compilation result from hardhat when remixd connects #group2': function (browser: NightwatchBrowser) {
    // artifacts/build-info/c7062fdd360381a85af23eeef31c98f8.json has already been created
    let remixd
    browser
      .perform((done) => {
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.dbg.json', JSON.stringify(hardhat_compilation_Lock_dbg))
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/contracts/Lock.json', JSON.stringify(hardhat_compilation_Lock))
        writeFileSync('./apps/remix-ide/contracts/hardhat/artifacts/build-info/14f7eb130f02e4d9abcd68528a373e96.json', JSON.stringify(hardhatCompilation))
        done()
      })
      .perform((done) => {
        remixd = spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/hardhat'))
        console.log('working directory', process.cwd())
        startRemixd(browser, done)
      })
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from hardhat').before(60000)
      
    browser.clickLaunchIcon('udapp')
      .selectContract('Lock')
      .createContract('1')
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('Unlock time should be in the future').before(60000)

    browser.perform(() => {
      remixd.kill()
    })
   },

   'Should listen on compilation result from foundry #group3': function (browser: NightwatchBrowser) {
    let remixd
    browser.perform((done) => {
      remixd = spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/foundry'))
      console.log('working directory', process.cwd())
      startRemixd(browser, done)
    })
    .perform((done) => {
      writeFileSync('./apps/remix-ide/contracts/foundry/out/Counter.sol/Counter.json', JSON.stringify(foundryCompilation))
      done()
    })
    .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from foundry').before(60000)
    
    let contractAaddress
    browser.clickLaunchIcon('udapp')
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

    browser.perform(() => {
      remixd.kill()
    }) 
   },

   'Should listen on compilation result from truffle #group4': function (browser: NightwatchBrowser) {
    let remixd
    browser.perform((done) => {
      remixd = spawnRemixd(join(process.cwd(), '/apps/remix-ide', '/contracts/truffle'))
      console.log('working directory', process.cwd())
      startRemixd(browser, done)      
    })
    .perform((done) => {
      writeFileSync('./apps/remix-ide/contracts/truffle/build/contracts/Migrations.json', JSON.stringify(truffle_compilation))
      done()
    })
    .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from truffle').before(60000)
    
    browser.clickLaunchIcon('udapp')
      .selectContract('Migrations')
      .createContract('')
      .testFunction('last',
        {
          status: 'true Transaction mined and execution succeed'
        })

    browser.perform(() => {
      remixd.kill()
    }) 
   }
}

function spawnRemixd (path: string) {
  const remixd = spawn('yarn run remixd', [`-s ${path}`], { cwd: process.cwd(), shell: true })
  remixd.stdout.on('data', function(data) {
    console.log('stdout: ' + data.toString())   
  })
  remixd.stderr.on('err', function(data) {
    console.log('err: ' + data.toString())   
  })
  return remixd
}

function startRemixd (browser: NightwatchBrowser, done: any) {
  const browserName = browser.options.desiredCapabilities.browserName
  if (browserName === 'safari' || browserName === 'internet explorer') {
    console.log('do not run remixd test for ' + browserName + ': sauce labs doesn\'t seems to handle websocket')
    browser.end()
    done()
    return
  }

  browser
    .waitForElementVisible('#icon-panel', 2000)
    .clickLaunchIcon('filePanel')
    .clickLaunchIcon('pluginManager')
    .scrollAndClick('#pluginManager *[data-id="pluginManagerComponentActivateButtonremixd"]')
    .waitForElementVisible('*[data-id="remixdConnect-modal-footer-ok-react"]', 2000)
    .pause(2000)
    .click('*[data-id="remixdConnect-modal-footer-ok-react"]')
    .perform(() => done())
}
