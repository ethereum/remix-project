import { NightwatchBrowser, NightwatchVerifyContractOpts, NightwatchCallbackResult } from 'nightwatch'
import EventEmitter from "events"

class VerifyContracts extends EventEmitter {
  command (this: NightwatchBrowser,compiledContractNames: string[], opts = { wait: 1000, version: null }): NightwatchBrowser {
    this.api.perform((done) => {
      verifyContracts(this.api, compiledContractNames, opts, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function getCompiledContracts (browser: NightwatchBrowser, opts: NightwatchVerifyContractOpts, callback: (result: NightwatchCallbackResult<any>) => void) {
  browser
  .clickLaunchIcon('solidity')
  .pause(opts.wait)
  .waitForElementPresent('*[data-id="compiledContracts"] option')
  .perform((done) => {
    if (opts.version) {
      browser
      .click('*[data-id="compilation-details"]')
      .waitForElementVisible('*[data-id="treeViewDivcompiler"]')
      .pause(2000)
      .click('*[data-id="treeViewDivcompiler"]')
      .waitForElementVisible('*[data-id="treeViewLicompiler/version"]')
      .assert.containsText('*[data-id="treeViewLicompiler/version"]', `version:\n ${opts.version}`)
      .perform(done)
    } else done()
  })
  .execute(function () {
    const contracts = document.querySelectorAll('*[data-id="compiledContracts"] option') as NodeListOf<HTMLInputElement>

    if (!contracts) {
      return null
    } else {
      const ret = []
      
      for (let c = 0; c < contracts.length; c++) {
        ret.push(contracts[c].value)
      }
      return ret
    }
  }, [], function (result) {
    callback(result)
  })
}

function verifyContracts (browser: NightwatchBrowser, compiledContractNames: string[], opts: NightwatchVerifyContractOpts, callback: VoidFunction) {
  getCompiledContracts(browser, opts, (result: NightwatchCallbackResult<any>) => {
    if (result.value) {
      for (const contract in compiledContractNames) {
        console.log(' - ' + compiledContractNames[contract], result.value)
        if (result.value.indexOf(compiledContractNames[contract]) === -1) {
          browser.assert.fail('compiled contract ' + compiledContractNames + ' not found', 'info about error', '')
          browser.end()
          return
        }
      }
    } else {
      browser.assert.fail('compiled contract ' + compiledContractNames + ' not found - none found', 'info about error', '')
      browser.end()
    }
    console.log('contracts all found ' + compiledContractNames)
    callback()
  })
}

module.exports = VerifyContracts
