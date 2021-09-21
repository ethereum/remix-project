import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ScrollToLine extends EventEmitter {
  command (this: NightwatchBrowser, line: number): NightwatchBrowser {
    this.api.execute(function (line) {
      const elem: any = document.getElementById('editorView')

      elem.gotoLine(line)
    }, [line], () => {
      this.emit('complete')
    })
    return this
  }
}

module.exports = ScrollToLine
