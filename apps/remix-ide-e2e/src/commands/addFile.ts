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
  browser.clickLaunchIcon('udapp')
    .clickLaunchIcon('fileExplorers')
    .click('li[data-id="treeViewLitreeViewItembrowser/README.txt"]') // focus on root directory
    .click('.newFile')
    .pause(2000)
    .sendKeys('[data-id="treeViewLitreeViewItembrowser/blank"]', name)
    .sendKeys('[data-id="treeViewLitreeViewItembrowser/blank"]', browser.Keys.ENTER)
    .pause(2000)
    .waitForElementVisible(`li[data-id="treeViewLitreeViewItembrowser/${name}"]`)
    .click(`li[data-id="treeViewLitreeViewItembrowser/${name}"]`)
    .setEditorValue(content.content)
    .pause(1000)
    .perform(function () {
      done()
    })
}

module.exports = AddFile
