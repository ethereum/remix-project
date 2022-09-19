import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class VerifyLoad extends EventEmitter {
    command(this: NightwatchBrowser) {
        browser.waitForElementPresent({
            selector: "//span[@data-id='typesloaded']",
            locateStrategy: 'xpath',
        })
        .waitForElementPresent({
            selector: "//span[@data-id='editorloaded']",
            locateStrategy: 'xpath',
        })
        .waitForElementPresent({
            selector: "//span[@data-id='workspaceloaded']",
            locateStrategy: 'xpath',
        })
        .waitForElementPresent({
            selector: "//span[@data-id='apploaded']",
            locateStrategy: 'xpath',
        })
        .perform((done) => {
            done()
            this.emit('complete')
        })
    }
}

module.exports = VerifyLoad