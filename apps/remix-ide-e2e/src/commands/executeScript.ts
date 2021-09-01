import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ExecuteScript extends EventEmitter {
  command (this: NightwatchBrowser, script: string): NightwatchBrowser {
    this.api
      .clearEditableContent('*[data-id="terminalCliInput"]')
      .click('*[data-id="terminalCli"]')
      .pause(2000)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.BACK_SPACE)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.BACK_SPACE)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.BACK_SPACE)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.BACK_SPACE)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.BACK_SPACE)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.BACK_SPACE)
      .sendKeys('*[data-id="terminalCliInput"]', script)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.ENTER)
      .sendKeys('*[data-id="terminalCliInput"]', this.api.Keys.ENTER)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = ExecuteScript
