import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ScrollInto extends EventEmitter {
  command (this: NightwatchBrowser, target: string): NightwatchBrowser {
    this.api.perform((client, done) => {
      _scrollInto(this.api, target, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function _scrollInto (browser: NightwatchBrowser, target: string, cb: VoidFunction): void {
  browser.execute(function (target) {
    document.querySelector(target).scrollIntoView(({ block: 'center' }))
  }, [target], function () {
    cb()
  })
}

module.exports = ScrollInto
