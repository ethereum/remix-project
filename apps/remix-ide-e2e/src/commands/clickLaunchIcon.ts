import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

export class ClickLaunchIcon extends EventEmitter {
  command (this: NightwatchBrowser, icon: string): NightwatchBrowser {
    this.api.waitForElementVisible('#icon-panel div[plugin="' + icon + '"]').click('#icon-panel div[plugin="' + icon + '"]').perform((done: VoidFunction) => {
      done()
      this.emit('complete')
    })
    return this
  }
}
