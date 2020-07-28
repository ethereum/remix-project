import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

export class SetEditorValue extends EventEmitter {
  command (this: NightwatchBrowser, value: string, callback?: VoidFunction): NightwatchBrowser {
    this.api.perform((client, done) => {
      this.api.execute(function (value) {
        const elem: any = document.querySelector('#modal-footer-ok')

        elem.editor.session.setValue(value)
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
