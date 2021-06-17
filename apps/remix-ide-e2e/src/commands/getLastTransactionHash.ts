import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetLastTransactionHash extends EventEmitter {
  command (this: NightwatchBrowser, cb: (hash: string) => void): NightwatchBrowser {
    this.api.perform((done) => {
      getLastTransactionHash(this.api, (hash) => {
        cb(hash)
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function getLastTransactionHash (browser: NightwatchBrowser, callback: (hash: string) => void) {
  browser.waitForElementPresent('*[data-shared="universalDappUiInstance"]')
    .execute(function () {
      const deployedContracts = document.querySelectorAll('*[data-id="terminalJournal"] > div')
      for (let i = deployedContracts.length - 1; i >= 0; i--) {
        const current = deployedContracts[i]
        const attr = current.getAttribute('data-id')
        // For web3 provider, a contract call simulates a tx hash starting with 'block_txcall'
        if (attr && (attr.replace('block_tx', '').startsWith('0x') || attr.replace('block_txcall', '').startsWith('0x'))) {
          return attr.replace('block_tx', '')
        }
      }
      return ''
    }, [], function (result) {
      const hash = typeof result.value === 'string' ? result.value : null

      callback(hash)
    })
}

module.exports = GetLastTransactionHash
