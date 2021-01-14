import { NightwatchBrowser, NightwatchContractContent } from 'nightwatch'
import EventEmitter from "events"

class AddFile extends EventEmitter {
  command (this: NightwatchBrowser, name: string, content: NightwatchContractContent): NightwatchBrowser {
    this.api.perform((done) => {
      addFile(this.api, name, content, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addFile (browser: NightwatchBrowser, name: string, content: NightwatchContractContent, done: VoidFunction) {
  browser.clickLaunchIcon('udapp').clickLaunchIcon('fileExplorers').click('.newFile')
    .pause(2000)
    .keys(name)
    .keys(browser.Keys.ENTER)
    .openFile('browser/' + name)
    .setEditorValue(content.content)
    .pause(1000)
    .perform(function () {
      done()
    })
}

module.exports = AddFile
