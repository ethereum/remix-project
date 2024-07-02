import EventEmitter from "events"
import { NightwatchBrowser } from "nightwatch"

class SelectFiles extends EventEmitter {
  command (this: NightwatchBrowser, selectedElements: any[]): NightwatchBrowser {
    const browser = this.api

    browser.perform(function () {
      const actions = this.actions({ async: true })
      actions.keyDown(this.Keys.SHIFT)
      for (let i = 0; i < selectedElements.length; i++) {
        actions.click(selectedElements[i].value)
      }
      return actions//.contextClick(selectedElements[0].value)
    })
    this.emit('complete')
    return this
  }
}

module.exports = SelectFiles
