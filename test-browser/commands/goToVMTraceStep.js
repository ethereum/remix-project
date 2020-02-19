const EventEmitter = require('events')

class GoToVmTraceStep extends EventEmitter {
  command (step, incr) {
    this.api.perform((done) => {
      goToVMtraceStep(this.api, step, incr, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function goToVMtraceStep (browser, step, incr, done) {
  if (!incr) incr = 0
  browser.execute(function (step) {
    return document.querySelector('#stepdetail').innerHTML
  }, [step], function (result) {
    if (result.value.indexOf('vm trace step: ' + step) !== -1) {
      done()
    } else if (incr > 1000) {
      console.log(result)
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

module.exports = GoToVmTraceStep
