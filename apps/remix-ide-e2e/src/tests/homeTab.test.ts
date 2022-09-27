'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

describe('HomeTab e2e test', function () {

    before(function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    })
  
    it('Should create new file', function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="homeTabNewFile"]')
        .click('*[data-id="homeTabNewFile"]')
    })
})