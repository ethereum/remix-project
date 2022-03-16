import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class OpenFile extends EventEmitter {
  command (this: NightwatchBrowser, name: string) {
    this.api.perform((done) => {
      openFile(this.api, name, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

// click on fileExplorer can toggle it. We go through settings to be sure FE is open
function openFile (browser: NightwatchBrowser, name: string, done: VoidFunction) {
  browser.perform((done) => {
    browser.element('css selector', '[data-id="verticalIconsKindfilePanel"] img[data-id="selected"]', (result) => {
            console.log(result)
            if (result.status === 0) {
                browser.clickLaunchIcon('filePanel').perform(done)
            } else done()
        })
    })  
    .waitForElementVisible('li[data-id="treeViewLitreeViewItem' + name + '"', 60000)
    .click('li[data-id="treeViewLitreeViewItem' + name + '"')
    .pause(2000)
    .perform(() => {
      done()
    })
}

module.exports = OpenFile
