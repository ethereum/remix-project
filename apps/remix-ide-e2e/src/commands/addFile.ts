import { NightwatchBrowser, NightwatchContractContent } from 'nightwatch'
import EventEmitter from 'events'

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
    .clickLaunchIcon('filePanel')
    .getLog('browser', function (logEntriesArray) {
      console.log('Log length: ' + logEntriesArray.length)
      logEntriesArray.forEach(function (log) {
        console.log('[' + log.level + '] ' + log.timestamp + ' : ' + log.message)
      })
    })
    .click('li[data-id="treeViewLitreeViewItemREADME.txt"]') // focus on root directory
    .click('.newFile')
    .waitForElementContainsText('*[data-id$="/blank"]', '', 60000)
    .sendKeys('*[data-id$="/blank"] .remixui_items', name)
    .sendKeys('*[data-id$="/blank"] .remixui_items', browser.Keys.ENTER)
    .pause(2000)
    .waitForElementVisible(`li[data-id="treeViewLitreeViewItem${name}"]`, 60000)
    .setEditorValue(content.content)
    .pause(1000)
    .perform(function () {
      done()
    })
}

module.exports = AddFile
