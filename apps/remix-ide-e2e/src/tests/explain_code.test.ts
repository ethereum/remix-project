'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import fs from 'fs'
module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
    'open file and go to number = num': function (browser: NightwatchBrowser) {
        browser
            .openFile('contracts')
            .openFile('contracts/1_Storage.sol')
            .waitForElementVisible('*[data-id="remix_ai_switch"]', 10000)
            .click('*[data-id="remix_ai_switch"]')
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'Solidity copilot activated!', 60000)
        const path = "//*[@class='view-line' and contains(.,'number') and contains(.,'=')]"
        browser.waitForElementVisible('#editorView')
            .click({
                locateStrategy: 'xpath',
                selector: path
            })
            .rightClick({
                locateStrategy: 'xpath',
                selector: path
            })
            // do things to click on the menu & check the results
    },
}