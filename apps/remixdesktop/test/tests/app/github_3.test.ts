import { NightwatchBrowser } from "nightwatch"

const useIsoGit = process.argv.includes('--use-isogit');
let commitCount = 0
let branchCount = 0
const tests = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        browser.hideToolTips()
        done()
    },

    'open default template': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
            .waitForElementVisible('button[data-id="landingPageImportFromTemplate"]')
            .click('button[data-id="landingPageImportFromTemplate"]')
            .waitForElementPresent('*[data-id="create-remixDefault"]')
            .scrollAndClick('*[data-id="create-remixDefault"]')
            .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
            .waitForElementPresent('[data-id="TemplatesSelectionModalDialogContainer-react"] .modal-ok')
            .click('[data-id="TemplatesSelectionModalDialogContainer-react"] .modal-ok')
            .pause(3000)
            .windowHandles(function (result) {
                console.log(result.value)
                browser.switchWindow(result.value[1])
                    .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
            })

    },
    'Update settings for git #group1 #group2': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('dgit')
            .pause(1000)
            .waitForElementVisible('*[data-id="initgit-btn"]')
            .click('*[data-id="initgit-btn"]')
            .waitForElementNotPresent('*[data-id="initgit-btn"]')
    },
    'launch github login via FE #group1 #group2': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('filePanel')
            .pause(1000)
            .waitForElementVisible('*[data-id="filepanel-login-github"]')
            .click('*[data-id="filepanel-login-github"]')
    },
    'login to github #group1 #group2': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="github-panel"]')
            .waitForElementVisible('*[data-id="gitubUsername"]')
            .setValue('*[data-id="githubToken"]', process.env.dgit_token)
            .pause(1000)
            .setValue('*[data-id="gitubUsername"]', 'git')
            .pause(1000)
            .setValue('*[data-id="githubEmail"]', 'git@example.com')
            .pause(1000)
            .click('*[data-id="saveGitHubCredentials"]')
    },
    'check if the settings are loaded #group1 #group2': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="connected-as-bunsenstraat"]')
            .waitForElementVisible('*[data-id="connected-img-bunsenstraat"]')
            .waitForElementVisible('*[data-id="connected-link-bunsenstraat"]')
            .waitForElementVisible('*[data-id="remotes-panel"]')
    },
    'check the FE for the auth user #group1 #group2': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('filePanel')
            .waitForElementVisible('*[data-id="filepanel-connected-img-bunsenstraat"]')
    },
    // pagination test
    'clone repo #group3': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('dgit')
            .waitForElementVisible('*[data-id="clone-panel"]')
            .click('*[data-id="clone-panel"]')
            .waitForElementVisible('*[data-id="clone-url"]')
            .setValue('*[data-id="clone-url"]', 'https://github.com/yann300/remix-reward')
            .waitForElementVisible('*[data-id="clone-branch"]')
            .setValue('*[data-id="clone-branch"]', 'master')
            .waitForElementVisible('*[data-id="clone-btn"]')
            .click('*[data-id="clone-btn"]')
            .clickLaunchIcon('filePanel')
            .pause(5000)
            .windowHandles(function (result) {
                console.log(result.value)
                browser.switchWindow(result.value[2])
                    .pause(1000)
                    .waitForElementVisible('*[data-id="treeViewLitreeViewItem.git"]')
            })
    },
    'Update settings for git #group3': function (browser: NightwatchBrowser) {
        browser.
            clickLaunchIcon('dgit')
            .waitForElementVisible('*[data-id="github-panel"]')
            .pause(1000)
            .click('*[data-id="github-panel"]')
            .pause(1000)
            .setValue('*[data-id="githubToken"]', 'invalidtoken')
            .pause(1000)
            .setValue('*[data-id="gitubUsername"]', 'git')
            .pause(1000)
            .setValue('*[data-id="githubEmail"]', 'git@example.com')
            .pause(1000)
            .click('*[data-id="saveGitHubCredentials"]')
            .pause(1000)
            .modalFooterOKClick('github-credentials-error')
    },
    'check the commits panel for pagination #group3': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="commits-panel"]')
            .click('*[data-id="commits-panel"]')
            .elements('xpath', '//*[@data-id="commits-current-branch-master"]//*[@data-type="commit-summary"]', function (result) {
                console.log('Number of commit-summary elements:', (result.value as any).length);
                if (useIsoGit) {
                    commitCount = (result.value as any).length
                    browser.assert.ok((result.value as any).length == 1)
                } else {
                    commitCount = (result.value as any).length
                    browser.assert.ok((result.value as any).length > 2)
                }
            })

    },
    'load more commits #group3': function (browser: NightwatchBrowser) {
        console.log('commitCount:', commitCount)
        browser
            .waitForElementVisible('*[data-id="load-more-commits"]')
            .click('*[data-id="load-more-commits"]')
            .waitForElementVisible('*[data-id="loader-indicator"]')
            .waitForElementNotPresent('*[data-id="loader-indicator"]')
            .pause(2000)
            .elements('xpath', '//*[@data-id="commits-current-branch-master"]//*[@data-type="commit-summary"]', function (result) {
                console.log('Number of commit-summary elements:', (result.value as any).length);
                browser.assert.ok((result.value as any).length > commitCount)
            })
    },
    'load more branches from remote #group3': function (browser: NightwatchBrowser) {

        browser
            .click('*[data-id="branches-panel"]')
            .waitForElementVisible({
                selector: '//*[@data-id="branches-panel-content-remote-branches"]',
                locateStrategy: 'xpath'
            })
            .elements('xpath', '//*[@data-id="branches-panel-content-remote-branches"]//*[@data-type="branches-branch"]', function (result) {
                console.log('Number of branches elements:', (result.value as any).length);
                if (useIsoGit) {
                    branchCount = (result.value as any).length
                    browser.assert.ok((result.value as any).length == 1)
                } else {
                    branchCount = (result.value as any).length
                    browser.assert.ok((result.value as any).length > 2)
                }
            })


        if (useIsoGit) {

            browser.waitForElementVisible('*[data-id="remote-sync-origin"]')
                .click('*[data-id="remote-sync-origin"]')
                .waitForElementVisible('*[data-id="loader-indicator"]')
                .waitForElementNotPresent('*[data-id="loader-indicator"]')
                .pause(2000)
                .elements('xpath', '//*[@data-id="branches-panel-content-remote-branches"]//*[@data-type="branches-branch"]', function (result) {
                    console.log('Number of branches elements:', (result.value as any).length);
                    browser.assert.ok((result.value as any).length > branchCount)
                })
        } else {
            browser.waitForElementVisible('*[data-id="show-more-branches-on-remote"]')
                .click('*[data-id="show-more-branches-on-remote"]')
                .pause(1000)
                .elements('xpath', '//*[@data-id="branches-panel-content-remote-branches"]//*[@data-type="branches-branch"]', function (result) {
                    console.log('Number of branches elements:', (result.value as any).length);
                    browser.assert.ok((result.value as any).length > branchCount)
                })
        }

    }
}

module.exports = tests