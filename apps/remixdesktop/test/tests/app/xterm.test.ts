import { NightwatchBrowser } from 'nightwatch'

module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        done()
    },
    'opem template': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="openFolderButton"]', 10000)
            .click('*[data-id="openFolderButton"]')
    },
    'open xterm linux and create a file': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="tabXTerm"]', 10000)
            .click('*[data-id="tabXTerm"]')
            .waitForElementVisible('*[data-type="remixUIXT"]', 10000)
            .click('*[data-type="remixUIXT"]')
            .perform(function () {
                const actions = this.actions({ async: true })
                return actions.sendKeys('echo "Hello, World!" > example.txt').sendKeys(this.Keys.ENTER)
            })
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemexample.txt"]', 10000)
    },
    'rename that file': function (browser: NightwatchBrowser) {
        browser
            .perform(function () {
                const actions = this.actions({ async: true })
                return actions.sendKeys('mv example.txt newExample.txt').sendKeys(this.Keys.ENTER)
            })
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemnewExample.txt"]', 10000)
    }
}