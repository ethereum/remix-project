import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class VerifyCallReturnValue extends EventEmitter {
  command (this: NightwatchBrowser, address: string, checks: string[]): NightwatchBrowser {
    this.api.perform((done) => {
      verifyCallReturnValue(this.api, address, checks, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function verifyCallReturnValue (browser: NightwatchBrowser, address: string, checks: string[], done: VoidFunction) {
  browser.execute(function (address: string) {
    const nodes = document.querySelectorAll('#instance' + address + ' [data-id="udapp_value"]') as NodeListOf<HTMLElement>
    const ret = []
    for (let k = 0; k < nodes.length; k++) {
      const text = nodes[k].innerText ? nodes[k].innerText : nodes[k].textContent
      ret.push(text.replace('\n', ''))
    }
    return ret
  }, [address], function (result) {
    for (const k in checks) {
      browser.assert.equal(result.value[k].trim(), checks[k].trim())
    }
    done()
  })
}

module.exports = VerifyCallReturnValue
