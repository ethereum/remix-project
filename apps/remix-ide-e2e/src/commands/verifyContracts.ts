import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class VerifyContracts extends EventEmitter {
  command(this: NightwatchBrowser, compiledContractNames: string[], opts = { version: null, runs: '200' }): NightwatchBrowser {
    this.api.perform((done) => {
      verifyContracts(this.api, compiledContractNames, opts, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function verifyContracts(browser: NightwatchBrowser, compiledContractNames: string[], opts: { version?: string, runs?: string }, callback: VoidFunction) {
  browser
    .clickLaunchIcon('solidity')
    .waitForElementPresent('*[data-id="compiledContracts"] option', 60000)
    .perform(() => {
      console.log(opts)
      for (const index in compiledContractNames) {
        browser.waitForElementPresent({
          selector: `//*[@data-id="compiledContracts" and contains(.,'${compiledContractNames[index]}')]`,
          locateStrategy: 'xpath'
        })
      }
    })
    .perform(async (done) => {
      if (opts && opts.version) {
        browser
          .click('*[data-id="compilation-details"]')
          .waitForElementVisible('*[data-id="remixui_treeviewitem_metadata"]')
          .click('*[data-id="remixui_treeviewitem_metadata"]')
          .waitForElementVisible('*[data-id="treeViewDivtreeViewItemcompiler"]')
          .click('*[data-id="treeViewDivtreeViewItemcompiler"]')
          .waitForElementVisible('*[data-id="treeViewLiversion"]')
          .assert.containsText('*[data-id="treeViewLiversion"]', `${opts.version}`)
          .click('[data-id="workspacesModalDialog-modal-footer-ok-react"]')
          .perform(() => {
            done()
            callback()
          })
      } if (opts && opts.runs) {
        browser
          .click('*[data-id="compilation-details"]')
          .waitForElementVisible('*[data-id="remixui_treeviewitem_metadata"]')
          .click('*[data-id="remixui_treeviewitem_metadata"]')
          .waitForElementVisible('*[data-id="treeViewDivtreeViewItemsettings"]')
          .click('*[data-id="treeViewDivtreeViewItemsettings"]')
          .waitForElementVisible('*[data-id="treeViewDivtreeViewItemoptimizer"]')
          .click('*[data-id="treeViewDivtreeViewItemoptimizer"]')
          .waitForElementVisible('*[data-id="treeViewDivruns"]')
          .assert.textContains('*[data-id="treeViewDivruns"]', `${opts.runs}`)
          .click('[data-id="workspacesModalDialog-modal-footer-ok-react"]')
          .perform(() => {
            done()
            callback()
          })
      } else {
        done()
        callback()
      }
    })
}

module.exports = VerifyContracts
