'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {

    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done, 'http://127.0.0.1:8080', true)
    },
    'Should find text': function (browser: NightwatchBrowser) {
        browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
        .click('*[plugin="search"]').waitForElementVisible('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'read').pause(1000)
        .waitForElementContainsText('*[data-id="search_results"]', '3_BALLOT.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'contracts', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'README.TXT', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'file must')
        .waitForElementContainsText('*[data-id="search_results"]', 'be compiled')
        .waitForElementContainsText('*[data-id="search_results"]', 'that person al')
        .waitForElementContainsText('*[data-id="search_results"]', 'sender.voted')
        .waitForElementContainsText('*[data-id="search_results"]', 'read')
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 6)
        })
    },
    'Should find regex': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="search_use_regex"]').click('*[data-id="search_use_regex"]')
        .waitForElementVisible('*[id="search_input"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', '^contract').pause(1000)
        .waitForElementContainsText('*[data-id="search_results"]', '3_BALLOT.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', '2_OWNER.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', '1_STORAGE.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', '4_BALLOT_TEST.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'tests', 60000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 4)
        })
    },
    'Should find matchcase': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="search_use_regex"]').click('*[data-id="search_use_regex"]')
        .waitForElementVisible('*[data-id="search_case_sensitive"]').click('*[data-id="search_case_sensitive"]')
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 0)
        })        
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'Contract').pause(1000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 6)
        })
        .waitForElementContainsText('*[data-id="search_results"]', 'DEPLOY_ETHERS.JS', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'DEPLOY_WEB3.JS', 60000) 
        .waitForElementContainsText('*[data-id="search_results"]', 'scripts', 60000)  
    },
    'Should find matchword': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="search_case_sensitive"]').click('*[data-id="search_case_sensitive"]')
        .waitForElementVisible('*[data-id="search_whole_word"]').click('*[data-id="search_whole_word"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'contract').pause(1000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 27)
        })
    },
    'Should replace text': function (browser: NightwatchBrowser) {
        browser
        .setValue('*[id="search_replace"]', 'replacing').pause(1000)
        .waitForElementVisible('*[data-id="contracts/2_Owner.sol-30-71"]')
        .moveToElement('*[data-id="contracts/2_Owner.sol-30-71"]', 10, 10)
        .waitForElementVisible('*[data-id="replace-contracts/2_Owner.sol-30-71"]')
        .click('*[data-id="replace-contracts/2_Owner.sol-30-71"]').pause(2000).
        modalFooterOKClick('confirmreplace').pause(2000).
        getEditorValue((content) => {
            browser.assert.ok(content.includes('replacing deployer for a constructor'), 'should replace text ok')
        })
    },
    'Should replace text without confirmation': function (browser: NightwatchBrowser) {
        browser.click('*[data-id="confirm_replace_label"]').pause(500)
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'replacing').pause(1000)
        .setValue('*[id="search_replace"]', '2').pause(1000)
        .waitForElementVisible('*[data-id="contracts/2_Owner.sol-30-71"]')
        .moveToElement('*[data-id="contracts/2_Owner.sol-30-71"]', 10, 10)
        .waitForElementVisible('*[data-id="replace-contracts/2_Owner.sol-30-71"]')
        .click('*[data-id="replace-contracts/2_Owner.sol-30-71"]').pause(2000).
        getEditorValue((content) => {
            browser.assert.ok(content.includes('replacing2 deployer for a constructor'), 'should replace text ok')
        })
    },
    'Should find text with include': function (browser: NightwatchBrowser) {
        browser
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'contract').pause(1000)
        .setValue('*[id="search_include"]', 'contracts/**').pause(2000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 4)
        })
    },
    'Should find text with exclude': function (browser: NightwatchBrowser) {
        browser
        .clearValue('*[id="search_include"]').pause(2000)
        .setValue('*[id="search_include"]', '**').pause(2000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 26)
        })
        .setValue('*[id="search_exclude"]', ',contracts/**').pause(2000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 22)
        })
    },
    'should clear search': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'nodata').pause(1000)
        .elements('css selector','.search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 0)
        })
    }
}