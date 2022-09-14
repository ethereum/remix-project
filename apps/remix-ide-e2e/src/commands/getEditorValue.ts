import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetEditorValue extends EventEmitter {
  command (this: NightwatchBrowser, callback: (content: string) => void): NightwatchBrowser {
    this.api.perform((client, done) => {
      this.api.execute(function () {
        const elem: any = document.getElementById('editorView')

        return elem.currentContent()
      }, [], (result) => {
        const value = typeof result.value === 'string' ? result.value : null
        callback(value)
        this.emit('complete')
        done()
      })
    })
    return this
  }
}

module.exports = GetEditorValue
