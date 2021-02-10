import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ClickLaunchIcon extends EventEmitter {
  command (this: NightwatchBrowser, icon: string): NightwatchBrowser {
    this.api.waitForElementVisible('#icon-panel div[plugin="' + icon + '"]').click('#icon-panel div[plugin="' + icon + '"]').perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = ClickLaunchIcon
