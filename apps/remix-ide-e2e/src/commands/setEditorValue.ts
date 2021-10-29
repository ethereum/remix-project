import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class SetEditorValue extends EventEmitter {
  command (this: NightwatchBrowser, value: string, callback?: VoidFunction): NightwatchBrowser {
    this.api.perform((client, done) => {
      this.api.execute(function (value) {
        const elem: any = document.getElementById('editorView')

        elem.setCurrentContent(value)
      }, [value], () => {
        done()
        if (callback) {
          callback.call(this.api)
        }
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = SetEditorValue
