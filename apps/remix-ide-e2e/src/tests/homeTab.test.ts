'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {

    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
  
    'Should create new file': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="homeTabStartCoding"]')
        .click('*[data-id="homeTabStartCoding"]')
        .waitForElementVisible('li[data-path="contracts/helloWorld.sol"]')
    }
}