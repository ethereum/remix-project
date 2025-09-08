import { NightwatchBrowser } from 'nightwatch'


module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        browser.hideToolTips()
        done()
    },
    'download compiler': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 60000)
            .clickLaunchIcon('solidity')
            .pause(1000)
            .setSolidityCompilerVersion('soljson-v0.8.23+commit.f704f362.js')
            .waitForElementVisible({
                selector: "//*[@data-id='selectedVersion' and contains(.,'0.8.23+commit.f704f362')]",
                locateStrategy: 'xpath'
            })
            .waitForElementContainsText('*[data-id="terminalJournal"]', 'Compiler downloaded from https://binaries.soliditylang.org/wasm/soljson-v0.8.23+commit.f704f362.js to soljson-v0.8.23+commit.f704f362.js', 60000)
            .waitForElementPresent({
                selector:
                    "//a[@data-id='dropdown-item-soljson-v0.8.23+commit.f704f362.js']//*[contains(@class, 'fa-arrow-circle-down')]",
                locateStrategy: 'xpath'
            })

    },
    'refresh': function (browser: NightwatchBrowser) {
        browser.refresh()
            .clickLaunchIcon('solidity')
            .waitForElementVisible('*[data-id="versionSelector"]')
            .click('*[data-id="versionSelector"]')
            .waitForElementPresent({
                selector:
                    "//a[@data-id='dropdown-item-soljson-v0.8.23+commit.f704f362.js']//*[contains(@class, 'fa-arrow-circle-down')]",
                locateStrategy: 'xpath'
            })
    }
}