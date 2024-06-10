import { ChildProcess, spawn } from "child_process"
import init from "../helpers/init"
import { Nightwatch, NightwatchBrowser } from "nightwatch"


module.exports = {
    '@disabled': true,
    before: function (browser, done) {
        init(browser, done)
    },
    after: function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            done()
        })
    },
    'Update settings for git #group1': function (browser: NightwatchBrowser) {
        browser.
            clickLaunchIcon('dgit')
            .waitForElementVisible('*[data-id="initgit-btn"]')
            .click('*[data-id="initgit-btn"]')
            .setValue('*[data-id="githubToken"]', process.env.dgit_token)
            .setValue('*[data-id="gitubUsername"]', 'git')
            .setValue('*[data-id="githubEmail"]', 'git@example.com')
            .click('*[data-id="saveGitHubCredentials"]')
    },
    'check if the settings are loaded #group1': function (browser: NightwatchBrowser) {
        browser.
            click('*[data-id="github-panel"]')
            .waitForElementVisible('*[data-id="connected-as-bunsenstraat"]')
            .waitForElementVisible('*[data-id="connected-img-bunsenstraat"]')
            .waitForElementVisible('*[data-id="connected-link-bunsenstraat"]')
    },
    'clone a repository #group1': function (browser: NightwatchBrowser) {
        browser
            .click('*[data-id="clone-panel"]')
            .click({
                selector: '//*[@data-id="clone-panel-content"]//*[@data-id="fetch-repositories"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="clone-panel-content"]//*[@id="repository-select"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="clone-panel-content"]//*[@id="repository-select"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="clone-panel-content"]//*[contains(text(), "awesome-remix")]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="clone-panel-content"]//*[contains(text(), "awesome-remix")]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="clone-panel-content"]//*[@id="branch-select"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="clone-panel-content"]//*[@id="branch-select"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="clone-panel-content"]//*[contains(text(), "master")]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="clone-panel-content"]//*[@data-id="clonebtn-ethereum/awesome-remix-master"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="clone-panel-content"]//*[@data-id="clonebtn-ethereum/awesome-remix-master"]',
                locateStrategy: 'xpath'
            })
    },
    'check if there is a README.md file #group1': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('filePanel')
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemREADME.md"]')
    }
}
