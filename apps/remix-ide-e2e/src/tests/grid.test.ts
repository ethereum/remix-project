'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
    },
    'pin chain': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('udapp')
            .pinGrid('vm-custom-fork', true)
            .waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
            .click('[data-id="settingsSelectEnvOptions"] button')
            .waitForElementVisible(`[data-id="dropdown-item-vm-custom-fork"]`)
            .click('[data-id="settingsSelectEnvOptions"] button') // close the dropdown
            .pinGrid('vm-sepolia-fork', true)
            .waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
            .click('[data-id="settingsSelectEnvOptions"] button')
            .waitForElementVisible(`[data-id="dropdown-item-vm-sepolia-fork"]`)
            .click('[data-id="settingsSelectEnvOptions"] button') // close the dropdown
    },
    'unpin chain': function (browser: NightwatchBrowser) {
        browser
            .pinGrid('vm-custom-fork', false)
            .waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
            .click('[data-id="settingsSelectEnvOptions"] button')
            .waitForElementNotPresent(`[data-id="dropdown-item-vm-custom-fork"]`)
            .click('[data-id="settingsSelectEnvOptions"] button') // close the dropdown
            .pinGrid('vm-sepolia-fork', false)
            .waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
            .click('[data-id="settingsSelectEnvOptions"] button')
            .waitForElementNotPresent(`[data-id="dropdown-item-vm-sepolia-fork"]`)
            .click('[data-id="settingsSelectEnvOptions"] button') // close the dropdown
    }
}