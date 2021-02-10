import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class TestEditorValue extends EventEmitter {
  command (this: NightwatchBrowser, testvalue: string): NightwatchBrowser {
    this.api.getEditorValue((value) => {
      this.api.assert.equal(testvalue, value)
      this.emit('complete')
    })
    return this
  }
}

module.exports = TestEditorValue
