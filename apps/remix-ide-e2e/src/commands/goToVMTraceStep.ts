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
  browser.execute(function (step) { (document.getElementById('slider') as HTMLInputElement).value = (step - 1).toString() }, [step])
    .setValue('*[data-id="slider"]', new Array(1).fill(browser.Keys.RIGHT_ARROW))
    .execute((step) => {
      (document.querySelector('*[data-id="slider"]') as any).internal_onmouseup({ target: { value: step }})
    }, [step])
    .pause(10000)
    .perform(() => {
      done()
    })
}

module.exports = GoToVmTraceStep
