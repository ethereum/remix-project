import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class RenamePath extends EventEmitter {
  command (this: NightwatchBrowser, path: string, newFileName: string, renamedPath: string) {
    this.api.perform((done) => {
      renamePath(this.api, path, newFileName, renamedPath, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function renamePath (browser: NightwatchBrowser, path: string, newFileName: string, renamedPath: string, done: VoidFunction) {
  browser.rightClick('[data-path="' + path + '"]')
      .click('#menuitemrename')
      .perform((client, doneSetValue) => {
        browser.execute(function (path, addvalue) {
          document.querySelector('[data-path="' + path + '"]').innerHTML = addvalue
        }, [path, newFileName], () => {
          doneSetValue()
        })
      })
      .pause(1000)
      .click('div[data-id="remixIdeMainPanel"]') // focus out to save
      .pause(2000)
      .waitForElementNotPresent('[data-path="' + path + '"]')
      .waitForElementPresent('[data-path="' + renamedPath + '"]')
      .perform(() => {
        done()
      })
}

module.exports = RenamePath
