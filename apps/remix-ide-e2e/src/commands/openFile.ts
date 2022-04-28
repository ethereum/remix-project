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
    browser.isVisible('[data-id="remixIdeSidePanel"]', (result) => {
      if (result.value) {
        // if side panel is shown, check this is the file panel
        browser.element('css selector', '[data-id="verticalIconsKindfilePanel"] img[data-id="selected"]', (result) => {
          if (result.status === 0) {
              done()
          } else browser.clickLaunchIcon('filePanel').perform(done)
        })
      } else browser.clickLaunchIcon('filePanel').perform(done)
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
