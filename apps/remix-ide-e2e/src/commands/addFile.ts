import { NightwatchBrowser, NightwatchContractContent } from 'nightwatch'
import EventEmitter from 'events'

class AddFile extends EventEmitter {
  command(this: NightwatchBrowser, name: string, content: NightwatchContractContent): NightwatchBrowser {
    this.api.perform((done) => {
      addFile(this.api, name, content, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addFile(browser: NightwatchBrowser, name: string, content: NightwatchContractContent, done: VoidFunction) {
  browser
    .isVisible({
      selector: "//*[@data-id='sidePanelSwapitTitle' and contains(.,'File explorer')]",
      locateStrategy: 'xpath',
      suppressNotFoundErrors: true,
      timeout: 1000
    }, (okVisible) => {
      if (!okVisible.value) {
        browser.clickLaunchIcon('filePanel')
      }
    })
    .scrollInto('li[data-id="treeViewLitreeViewItemREADME.txt"]')
    .waitForElementVisible('li[data-id="treeViewLitreeViewItemREADME.txt"]')
    .click('li[data-id="treeViewLitreeViewItemREADME.txt"]').pause(1000) // focus on root directory
    .isVisible({
      selector: `//*[@data-id="treeViewLitreeViewItem${name}"]`,
      locateStrategy: 'xpath',
      abortOnFailure: false,
      suppressNotFoundErrors: true,
      timeout: 2000
    }, (okVisible) => {
      // @ts-ignore
      // status === -1 means the element is not visible, 0 means it is visible
      if (okVisible.status === 0) {
        browser.openFile(name)
          .perform(function () {
            done()
          })
      } else {
        browser.click('[data-id="fileExplorerNewFilecreateNewFile"]')
          .waitForElementContainsText('*[data-id$="/blank"]', '', 60000)
          .sendKeys('*[data-id$="/blank"] .remixui_items', name)
          .sendKeys('*[data-id$="/blank"] .remixui_items', browser.Keys.ENTER)
          .isVisible({
            selector: `li[data-id="treeViewLitreeViewItem${name}"]`,
            abortOnFailure: false,
            suppressNotFoundErrors: true,
            timeout: 60000
          })
          .setEditorValue(content.content)
          .perform(function () {
            done()
          })
      }
    })
}

module.exports = AddFile
