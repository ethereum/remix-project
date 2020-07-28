import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

export class GoToVmTraceStep extends EventEmitter {
  command (this: NightwatchBrowser, step: number, incr?: number): NightwatchBrowser {
    this.api.perform((done: VoidFunction) => {
      goToVMtraceStep(this.api, step, incr, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function goToVMtraceStep (browser: NightwatchBrowser, step: number, incr: number, done: VoidFunction) {
  if (!incr) incr = 0
  browser.execute(function () {
    return document.querySelector('#stepdetail').innerHTML
  }, [], function (result) {
    if (typeof result.value === 'string' && ( result.value.indexOf('vm trace step:') !== -1 && result.value.indexOf(step.toString()) !== -1)) {
      done()
    } else if (incr > 1000) {
      browser.assert.fail('goToVMtraceStep fails', 'info about error', '')
      done()
    } else {
      incr++
      browser.click('#intoforward')
          .perform(() => {
            setTimeout(() => {
              goToVMtraceStep(browser, step, incr, done)
            }, 200)
          })
    }
  })
}
