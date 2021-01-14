import { NightwatchBrowser, NightwatchContractContent } from 'nightwatch'
import EventEmitter from "events"

class AddFile extends EventEmitter {
  command (this: NightwatchBrowser, name: string, content: NightwatchContractContent, open = true): NightwatchBrowser {
    this.api.perform((done) => {
      addFile(this.api, name, content, open, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addFile (browser: NightwatchBrowser, name: string, content: NightwatchContractContent, open: boolean, done: VoidFunction) {
  browser.clickLaunchIcon('udapp').clickLaunchIcon('fileExplorers').click('.newFile')
    .pause(2000)
    .keys(name)
    .keys(browser.Keys.ENTER)
    .perform((done) => {
      if (open) {
        browser.openFile('browser/' + name)
          .setEditorValue(content.content)
      }
      done()
    })
    .pause(1000)
    .perform(function () {
      done()
    })
}

module.exports = AddFile
