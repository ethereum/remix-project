'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

import examples from '../examples/example-contracts'

const sources = [
    { 'Untitled.sol': { content: examples.ballot.content } }
]

module.exports = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done, 'http://127.0.0.1:8080', false)
    },
    'confirm Matomo #group1 #flaky': function (browser: NightwatchBrowser) {
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
    'decline Matomo #group1': function (browser: NightwatchBrowser) {
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
    'blur matomo #group2': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                localStorage.removeItem('config-v0.8:.remix.config')
                localStorage.setItem('showMatomo', 'true')
                localStorage.removeItem('matomo-analytics-consent')
            }, [])
                .pause(1000)
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
    'matomo should reappear #group2': function (browser: NightwatchBrowser) {
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
    'change settings #group2': function (browser: NightwatchBrowser) {
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
    },
    'should get enter dialog again #group2': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="beginnerbtn"]', 10000)
            .pause(1000)
            .click('[data-id="beginnerbtn"]')
            .waitForElementNotPresent('*[data-id="beginnerbtn"]')
            .waitForElementVisible({
                selector: `//*[contains(text(), 'Welcome to Remix IDE')]`,
                locateStrategy: 'xpath'
            })
            .waitForElementVisible('*[id="remixTourSkipbtn"]')
            .click('*[id="remixTourSkipbtn"]')
            .clickLaunchIcon('settings')
            .waitForElementPresent('[id="settingsMatomoAnalytics"]:checked')
            .execute(function () {
                return JSON.parse(window.localStorage.getItem('config-v0.8:.remix.config'))['settings/matomo-analytics'] == true
            }, [], (res) => {
                console.log('res', res)
                browser.assert.ok((res as any).value, 'matomo analytics is enabled')
            })
    },
    'decline Matomo and check timestamp #group3': function (browser: NightwatchBrowser) {
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
            .execute(function () {
                return window.localStorage.getItem('matomo-analytics-consent')
            }, [], (res) => {
                console.log('res', res)
                browser.assert.ok((res as any).value, 'matomo analytics consent timestamp is set')
            })
    },
    'check old timestamp and reappear Matomo #group3': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                const oldTimestamp = new Date()
                oldTimestamp.setMonth(oldTimestamp.getMonth() - 7)
                localStorage.setItem('matomo-analytics-consent', oldTimestamp.toString())
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
    },
    'check recent timestamp and do not reappear Matomo #group3': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                const recentTimestamp = new Date()
                recentTimestamp.setMonth(recentTimestamp.getMonth() - 1)
                localStorage.setItem('matomo-analytics-consent', recentTimestamp.toString())
            }, [])
                .refreshPage()
                .perform(done())
        })
            .waitForElementPresent({
                selector: `//*[@data-id='compilerloaded']`,
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .pause(2000)
            .waitForElementNotPresent('*[data-id="matomoModalModalDialogModalBody-react"]')
    },
    'accept Matomo and check timestamp #group3': function (browser: NightwatchBrowser) {
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
            .click('[data-id="matomoModal-modal-footer-ok-react"]') // accept
            .waitForElementNotVisible('*[data-id="matomoModalModalDialogModalBody-react"]')
            .pause(2000)
            .execute(function () {
                return window.localStorage.getItem('matomo-analytics-consent')
            }, [], (res) => {
                console.log('res', res)
                browser.assert.ok((res as any).value, 'matomo analytics consent timestamp is set')
            })
    },
    'check old timestamp and do not reappear Matomo after accept #group3': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                const oldTimestamp = new Date()
                oldTimestamp.setMonth(oldTimestamp.getMonth() - 7)
                localStorage.setItem('matomo-analytics-consent', oldTimestamp.toString())
            }, [])
                .refreshPage()
                .perform(done())
        })
            .waitForElementPresent({
                selector: `//*[@data-id='compilerloaded']`,
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .pause(2000)
            .waitForElementNotPresent('*[data-id="matomoModalModalDialogModalBody-react"]')
    },
    'check recent timestamp and do not reappear Matomo after accept #group3': function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            browser.execute(function () {
                const recentTimestamp = new Date()
                recentTimestamp.setMonth(recentTimestamp.getMonth() - 1)
                localStorage.setItem('matomo-analytics-consent', recentTimestamp.toString())
            }, [])
                .refreshPage()
                .perform(done())
        })
            .waitForElementPresent({
                selector: `//*[@data-id='compilerloaded']`,
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .pause(2000)
            .waitForElementNotPresent('*[data-id="matomoModalModalDialogModalBody-react"]')
    },
    'verify Matomo events are tracked on app start #group4': function (browser: NightwatchBrowser) {
        browser
            .execute(function () {
                return (window as any)._paq
            }, [], (res) => {
                const expectedEvents = [
                    ["trackEvent", "Preload", "start"],
                    ["trackEvent", "Storage", "activate", "indexedDB"],
                    ["trackEvent", "App", "load"],
                ];

                const actualEvents = (res as any).value;

                const areEventsPresent = expectedEvents.every(expectedEvent =>
                    actualEvents.some(actualEvent =>
                        JSON.stringify(actualEvent) === JSON.stringify(expectedEvent)
                    )
                );

                browser.assert.ok(areEventsPresent, 'Matomo events are tracked correctly');
            })
    },
    '@sources': function () {
        return sources
    },
    'Add Ballot #group4': function (browser: NightwatchBrowser) {
        browser
            .addFile('Untitled.sol', sources[0]['Untitled.sol'])
    },
    'Deploy Ballot #group4': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
            .clickLaunchIcon('solidity')
            .waitForElementVisible('*[data-id="compilerContainerCompileBtn"]')
            .click('*[data-id="compilerContainerCompileBtn"]')
            .testContracts('Untitled.sol', sources[0]['Untitled.sol'], ['Ballot'])
            .pause()
    },

}