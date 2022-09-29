'use strict'
import { NightwatchBrowser } from 'nightwatch'
import { writeFileSync } from 'fs'
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
    browser.perform((done) => {
      console.log('working directory', process.cwd())

      writeFileSync('./apps/remix-ide/contracts/artifacts/contracts/Lock.dbg.json', JSON.stringify(hardhat_compilation_Lock_dbg))
      writeFileSync('./apps/remix-ide/contracts/artifacts/contracts/Lock.json', JSON.stringify(hardhat_compilation_Lock))
      writeFileSync('./apps/remix-ide/contracts/artifacts/build-info/14f7eb130f02e4d9abcd68528a373e96.json', JSON.stringify(hardhatCompilation))
      done()
    })
    .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from hardhat').before(60000)
      
    browser.clickLaunchIcon('udapp')
      .selectContract('Lock')
      .createContract('1')
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('Unlock time should be in the future').before(60000)
   },

   'Should load compilation result from hardhat when remixd connects #group2': function (browser: NightwatchBrowser) {
    // artifacts/build-info/c7062fdd360381a85af23eeef31c98f8.json has already been created
    browser
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('receiving compilation result from hardhat').before(60000)
      
    browser.clickLaunchIcon('udapp')
      .selectContract('Lock')
      .createContract('1')
      .expect.element('*[data-id="terminalJournal"]').text.to.contain('Unlock time should be in the future').before(60000)
   },

   'Should listen on compilation result from foundry #group3': function (browser: NightwatchBrowser) {
    browser.perform((done) => {
      console.log('working directory', process.cwd())
      writeFileSync('./apps/remix-ide/contracts/out/Counter.sol/Counter.json', JSON.stringify(foundryCompilation))
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
   },

   'Should listen on compilation result from truffle #group4': function (browser: NightwatchBrowser) {
    browser.perform((done) => {
      console.log('working directory', process.cwd())
      writeFileSync('./apps/remix-ide/contracts/build/contracts/Migrations.json', JSON.stringify(truffle_compilation))
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
   }
}
