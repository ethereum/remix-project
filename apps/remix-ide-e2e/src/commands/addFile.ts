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
    .waitForElementVisible('#modal-dialog')
    .perform((client, done) => {
      browser.execute(function (fileName) {
        if (fileName !== 'Untitled.sol') {
          document.querySelector('#modal-dialog #prompt_text').setAttribute('value', fileName)
        }
        const elem = document.querySelector('#modal-footer-ok') as HTMLElement

        elem.click()
      }, [name], function (result) {
        console.log(result)
        done()
      })
    })
    .setEditorValue(content.content)
    .pause(1000)
    .perform(function () {
      done()
    })
}

module.exports = AddFile
