'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
    'confirmMatomo #group1': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser
                .execute(function () {
                    localStorage.removeItem('config-v0.8:.remix.config')
                    localStorage.setItem('showMatomo', 'true')
                }, [])
                .refreshPage()
                .perform(done())
        })
            .waitForElementVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .pause(1000)
            .click('[data-id="matomoModal-modal-footer-ok-react"]') // submitted
            .waitForElementNotVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .waitForElementVisible('*[data-id="beginnerbtn"]', 10000)
            .pause(1000)
            .click('[data-id="beginnerbtn"]')
            .waitForElementNotPresent('*[data-id="beginnerbtn"]')
            .waitForElementVisible({
                selector: `//*[contains(text(), 'Welcome to Remix IDE')]`,
                locateStrategy: 'xpath'
            })
            .refreshPage()
            .waitForElementPresent({
                selector: `//*[@data-id='compilerloaded']`,
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .waitForElementNotPresent('*[data-id="matomoModalModalDialogModalBody-react"]')
            .clickLaunchIcon('settings')
            .verify.elementPresent('[id="settingsMatomoAnalytics"]:checked')
            .execute(function () {
                return JSON.parse(window.localStorage.getItem('config-v0.8:.remix.config'))['settings/matomo-analytics'] == true
            }, [], (res) => {
                console.log('res', res)
                browser.assert.ok((res as any).value, 'matomo analytics is enabled')
            })
    },
    'declineMatomo #group1': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                localStorage.removeItem('config-v0.8:.remix.config')
                localStorage.setItem('showMatomo', 'true')
                localStorage.removeItem('matomo-analytics-consent')
            }, [])
                .refreshPage()
                .perform(done())
        })
            .waitForElementPresent({
                selector: `//*[@data-id='compilerloaded']`,
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .waitForElementVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .click('[data-id="matomoModal-modal-footer-cancel-react"]') // cancel
            .waitForElementNotVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .pause(2000)
            .waitForElementNotPresent('*[data-id="beginnerbtn"]', 10000)
            .clickLaunchIcon('settings')
            .waitForElementNotPresent('[id="settingsMatomoAnalytics"]:checked')
            .execute(function () {
                return JSON.parse(window.localStorage.getItem('config-v0.8:.remix.config'))['settings/matomo-analytics'] == false
            }, [], (res) => {
                console.log('res', res)
                browser.assert.ok((res as any).value, 'matomo analytics is disabled')
            })
    },
    'blurMatomo #group1': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                localStorage.removeItem('config-v0.8:.remix.config')
                localStorage.setItem('showMatomo', 'true')
                localStorage.removeItem('matomo-analytics-consent')
            }, [])
                .refreshPage()
                .perform(done())
        })
            .waitForElementPresent({
                selector: `//*[@data-id='compilerloaded']`,
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .waitForElementVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .waitForElementVisible('*[data-id="matomoModal-modal-close"]')
            .click('[data-id="matomoModal-modal-close"]')
            .waitForElementNotVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .pause(2000)
            .waitForElementNotPresent('*[data-id="beginnerbtn"]', 10000)
            .clickLaunchIcon('settings')
            .waitForElementNotPresent('[id="settingsMatomoAnalytics"]:checked')
            .execute(function () {
                return JSON.parse(window.localStorage.getItem('config-v0.8:.remix.config'))['settings/matomo-analytics'] == undefined
            }, [], (res) => {
                console.log('res', res)
                browser.assert.ok((res as any).value, 'matomo analytics is undefined')
            })
    },
    'shouldReappearMatomo #group1': function (browser: NightwatchBrowser) {
        browser
        .refreshPage()
        .waitForElementPresent({
            selector: `//*[@data-id='compilerloaded']`,
            locateStrategy: 'xpath',
            timeout: 120000
        })
        .waitForElementVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
        .waitForElementVisible('*[data-id="matomoModal-modal-close"]')
        .click('[data-id="matomoModal-modal-close"]')
        .waitForElementNotVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
    },
    'changeSettings #group1' : function (browser: NightwatchBrowser) {
        browser
        .clickLaunchIcon('settings')
        .waitForElementVisible('*[data-id="label-matomo-settings"]')
        .pause(1000)
        .click('*[data-id="label-matomo-settings"]')
        .refreshPage()
        .waitForElementPresent({
            selector: `//*[@data-id='compilerloaded']`,
            locateStrategy: 'xpath',
            timeout: 120000
        })
        .waitForElementNotPresent('*[data-id="matomoModalModalDialogModalBody-react"]')
        .clickLaunchIcon('settings')
        .waitForElementPresent('[id="settingsMatomoAnalytics"]:checked')
        .execute(function () {
            return JSON.parse(window.localStorage.getItem('config-v0.8:.remix.config'))['settings/matomo-analytics'] == true
        }, [], (res) => {
            console.log('res', res)
            browser.assert.ok((res as any).value, 'matomo analytics is enabled')
        })
    }
}