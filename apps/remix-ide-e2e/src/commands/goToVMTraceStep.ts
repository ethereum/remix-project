import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'
class GoToVmTraceStep extends EventEmitter {
  command (this: NightwatchBrowser, step: number, incr?: number): NightwatchBrowser {
    goToVMtraceStep(this.api, step, incr, () => {
      this.emit('complete')
    })
    return this
  }
}

function goToVMtraceStep (browser: NightwatchBrowser, step: number, incr: number, done: VoidFunction) {
  browser.execute(function () { document.getElementById('slider')['value'] = step - 1 }) // It only moves slider to 50 but vm traces are not updated
   .setValue('*[data-id="slider"]', new Array(1).fill(browser.Keys.RIGHT_ARROW))
   .perform(() => {
          done()
        })
}

module.exports = GoToVmTraceStep
