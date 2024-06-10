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
    },
    'check the commands panel #group1': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('dgit')
            .click('*[data-id="commands-panel"]')
            .waitForElementVisible({
                selector: "//div[@id='commands-remote-branch-select']//div[contains(@class, 'singleValue') and contains(text(), 'master')]",
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: "//div[@id='commands-remote-origin-select']//div[contains(@class, 'singleValue') and contains(text(), 'origin')]",
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: "//div[@id='commands-local-branch-select']//div[contains(@class, 'singleValue') and contains(text(), 'master')]",
                locateStrategy: 'xpath'
            })  
    },
    'check the remotes #group1': function (browser: NightwatchBrowser) {
        browser
            
            .click('*[data-id="remotes-panel"]')
            .waitForElementVisible('*[data-id="remotes-panel-content"]')
            .click({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="remote-detail-origin"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-current-branch-master"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="remote-sync-origin"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-branch-links"]',
                locateStrategy: 'xpath'
            })

    },
    'check the commits of branch links #group1': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-branch-links"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-branch-links"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="commit-summary-linking fixed-"]',
                locateStrategy: 'xpath'
            })
    },
    'switch to branch links #group1': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-branch-links"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-toggle-branch-links"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="remotes-panel-content"]//*[@data-id="branches-toggle-current-branch-links"]',
                locateStrategy: 'xpath'
            })
    },
    'check the local branches #group1': function (browser: NightwatchBrowser) {
        browser
            .click('*[data-id="branches-panel"]')
            .waitForElementVisible({
                selector: '//*[@data-id="branches-panel-content"]//*[@data-id="branches-toggle-current-branch-links"]',
                locateStrategy: 'xpath'
            })
    },
    'check the local commits #group1': function (browser: NightwatchBrowser) {
        browser
            .click('*[data-id="commits-panel"]')
            .pause(1000)
            .waitForElementVisible({
                selector: '//*[@data-id="commits-current-branch-links"]//*[@data-id="commit-summary-linking fixed-"]',
                locateStrategy: 'xpath'
            })
            .click({
                selector: '//*[@data-id="commits-current-branch-links"]//*[@data-id="commit-summary-linking fixed-"]',
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: '//*[@data-id="commits-current-branch-links"]//*[@data-id="commit-change-modified-README.md"]',
                locateStrategy: 'xpath'
            })
    },
    'check the commands panel for links #group1': function (browser: NightwatchBrowser) {
        browser
            .click('*[data-id="commands-panel"]')
            .waitForElementVisible({
                selector: "//div[@id='commands-remote-branch-select']//div[contains(@class, 'singleValue') and contains(text(), 'links')]",
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: "//div[@id='commands-remote-origin-select']//div[contains(@class, 'singleValue') and contains(text(), 'origin')]",
                locateStrategy: 'xpath'
            })
            .waitForElementVisible({
                selector: "//div[@id='commands-local-branch-select']//div[contains(@class, 'singleValue') and contains(text(), 'links')]",
                locateStrategy: 'xpath'
            })   
    }
}
