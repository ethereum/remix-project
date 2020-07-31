import { NightwatchBrowser } from "nightwatch"
import EventEmitter from "events"

class GetEditorValue extends EventEmitter {
  command (this: NightwatchBrowser, callback: (content: string) => void): NightwatchBrowser {
    this.api.perform((client, done) => {
      this.api.execute(function () {
        const elem: any =  document.getElementById('input')

        elem.editor.getValue()
      }, [], (result) => {
        done()
        callback(typeof result.value === 'string' ? result.value : '')
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = GetEditorValue
