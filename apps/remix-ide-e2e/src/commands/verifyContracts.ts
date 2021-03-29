import { NightwatchBrowser   } from 'nightwatch'
import EventEmitter from 'events'

class VerifyContracts extends EventEmitter {
  command (this: NightwatchBrowser, compiledContractNames: string[], opts = { wait: 1000, version: null }): NightwatchBrowser {
    this.api.perform((done) => {
      verifyContracts(this.api, compiledContractNames, opts, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function verifyContracts (browser: NightwatchBrowser, compiledContractNames: string[], opts: { wait: number, version?: string }, callback: VoidFunction) {
  browser
    .clickLaunchIcon('solidity')
    .pause(opts.wait)
    .waitForElementPresent('*[data-id="compiledContracts"] option', 60000)
    .perform((done) => {
      if (opts.version) {
        browser
          .click('*[data-id="compilation-details"]')
          .waitForElementVisible('*[data-id="treeViewDivcompiler"]')
          .pause(2000)
          .click('*[data-id="treeViewDivcompiler"]')
          .waitForElementVisible('*[data-id="treeViewLicompiler/version"]')
          .assert.containsText('*[data-id="treeViewLicompiler/version"]', `version:\n ${opts.version}`)
          .modalFooterCancelClick()
          .perform(done)
      } else {
        compiledContractNames.forEach((name) => {
          browser.waitForElementContainsText('[data-id="compiledContracts"]', name, 60000)
        })
        done()
        callback()
      }
    })
}

module.exports = VerifyContracts
