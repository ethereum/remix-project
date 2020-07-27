import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

class ClickLaunchIcon extends EventEmitter {
  command (this: NightwatchBrowser, icon: string) {
    this.api.waitForElementVisible('#icon-panel div[plugin="' + icon + '"]').click('#icon-panel div[plugin="' + icon + '"]').perform((done: CallableFunction) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = ClickLaunchIcon
