'use strict'
import { NightwatchBrowser } from "nightwatch"
import init from "../helpers/init"
import sauce from "./sauce"

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  'Should not be able to create GIT without credentials #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .waitForElementVisible({
        selector: "//*[@class='text-warning' and contains(.,'add username and email')]",
        locateStrategy: 'xpath'
      })
      .waitForElementPresent({
        selector: '//*[@data-id="initGitRepository"][@disabled]',
        locateStrategy: 'xpath'
      })
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_blank' })
      .click('[data-id="initGitRepositoryLabel"]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItem.git"]')
      .waitForElementNotVisible('[data-id="workspaceGitPanel"]')
  },
  'Should add credentials #group1 #group2 #group3': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('settings')
      .setValue('[data-id="settingsTabGithubUsername"]', 'circleci')
      .setValue('[data-id="settingsTabGithubEmail"]', 'remix@circleci.com')
      .click('[data-id="settingsTabSaveGistToken"]')
  },

  'Should create and initialize a GIT repository #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementNotVisible('[data-id="workspaceGitPanel"]')
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_blank' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=blank]')
      .click('[data-id="initGitRepositoryLabel"]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('[data-id="workspaceGitPanel"]')
      .waitForElementContainsText('[data-id="workspaceGitBranchesDropdown"]', 'main')
  },

  // CLONE REPOSITORY E2E START

  'Should clone a repository #group2': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('[data-id="workspaceMenuDropdown"]')
      .click('[data-id="workspaceMenuDropdown"]')
      .waitForElementVisible('[data-id="workspaceclone"]')
      .click('[data-id="workspaceclone"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .waitForElementPresent('.fa-spinner')
      .pause(5000)
      .waitForElementNotPresent('.fa-spinner')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItem.git"]')
      .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix')
  },

  'Should display dgit icon for cloned workspace #group2': function (browser: NightwatchBrowser) {
    browser
      .switchWorkspace('default_workspace')
      .waitForElementNotVisible('[data-id="workspacesSelect"] .fa-code-branch')
      .switchWorkspace('awesome-remix')
      .waitForElementVisible('[data-id="workspacesSelect"] .fa-code-branch')
  },

  'Should display non-clashing names for duplicate clone #group2': '' + function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="workspaceMenuDropdown"]')
      .waitForElementVisible('[data-id="workspaceclone"]')
      .click('[data-id="workspaceclone"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .pause(5000)
      .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix1')
      .click('[data-id="workspaceMenuDropdown"]')
      .waitForElementVisible('[data-id="workspaceclone"]')
      .click('[data-id="workspaceclone"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .pause(5000)
      .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix2')
      .click('[data-id="workspaceMenuDropdown"]')
      .waitForElementVisible('[data-id="workspaceDropdownMenuIcon]"')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .pause(5000)
      .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix3')
      .switchWorkspace('awesome-remix')
      .switchWorkspace('awesome-remix1')
      .switchWorkspace('awesome-remix2')
      .switchWorkspace('awesome-remix3')
  },

  'Should display error message in modal for failed clone #group2': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="workspaceDropdownMenuIcon"]')
      .click('[data-id="workspaceMenuDropdown"]')
      .waitForElementVisible('[data-id="workspaceclone"]')
      .click('[data-id="workspaceclone"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/non-existent-repo')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .pause(5000)
      .waitForElementVisible('[data-id="cloneGitRepositoryModalDialogModalBody-react"]')
      .waitForElementContainsText('[data-id="cloneGitRepositoryModalDialogModalBody-react"]', 'An error occurred: Please check that you have the correct URL for the repo. If the repo is private, you need to add your github credentials (with the valid token permissions) in Settings plugin')
      .click('[data-id="cloneGitRepository-modal-footer-ok-react"]')
  },

  // CLONE REPOSITORY E2E END

  // GIT BRANCHES E2E START
  'Should show all cloned repo branches #group3': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .waitForElementNotVisible('[data-id="workspaceGitPanel"]')
      .click('[data-id="workspaceMenuDropdown"]')
      .waitForElementVisible('[data-id="workspaceclone"]')
      .click('[data-id="workspaceclone"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ioedeveloper/test-branch-change')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .waitForElementPresent('.fa-spinner')
      .pause(5000)
      .waitForElementNotPresent('.fa-spinner')
      .waitForElementContainsText('[data-id="workspacesSelect"]', 'test-branch-change')
      .waitForElementVisible('[data-id="workspaceGitPanel"]')
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .waitForElementVisible('[data-id="custom-dropdown-menu"]')
      .waitForElementContainsText('[data-id="custom-dropdown-items"]', 'origin/dev')
      .waitForElementContainsText('[data-id="custom-dropdown-items"]', 'origin/production')
      .waitForElementContainsText('[data-id="custom-dropdown-items"]', 'origin/setup')
      .expect.element('[data-id="workspaceGit-main"]').text.to.contain('✓ ')
  },

  'Should a checkout to a remote branch #group3': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="custom-dropdown-menu"]')
      .waitForElementContainsText('[data-id="custom-dropdown-items"]', 'origin/dev')
      .waitForElementPresent('[data-id="workspaceGit-origin/dev"]')
      .click('[data-id="workspaceGit-origin/dev"]')
      .pause(5000)
      .waitForElementPresent('[data-id="treeViewDivtreeViewItemdev.ts"]')
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .expect.element('[data-id="workspaceGit-dev"]').text.to.contain('✓ ')
  },

  'Should search for a branch (local and remote) #group3': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="custom-dropdown-menu"]')
      .waitForElementPresent('[data-id="workspaceGitInput"]')
      .sendKeys('[data-id="workspaceGitInput"]', 'setup')
      .waitForElementNotPresent('[data-id="workspaceGit-origin/dev"]')
      .waitForElementNotPresent('[data-id="workspaceGit-origin/production"]')
      .waitForElementNotPresent('[data-id="workspaceGit-dev"]')
      .waitForElementNotPresent('[data-id="workspaceGit-main"]')
      .waitForElementPresent('[data-id="workspaceGit-origin/setup"]')
  },

  'Should checkout to a new local branch #group3': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="custom-dropdown-menu"]')
      .waitForElementPresent('[data-id="workspaceGitInput"]')
      .clearValue('[data-id="workspaceGitInput"]')
      .sendKeys('[data-id="workspaceGitInput"]', 'newLocalBranch')
      .waitForElementContainsText('[data-id="workspaceGitCreateNewBranch"]', `Create branch: newLocalBranch from 'dev'`)
      .click('[data-id="workspaceGitCreateNewBranch"]')
      .pause(2000)
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .waitForElementVisible('[data-id="custom-dropdown-menu"]')
      .expect.element('[data-id="workspaceGit-newLocalBranch"]').text.to.contain('✓ ')
  },

  'Should checkout to an exisiting local branch #group3': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="custom-dropdown-menu"]')
      .waitForElementPresent('[data-id="workspaceGitInput"]')
      .clearValue('[data-id="workspaceGitInput"]')
      .sendKeys('[data-id="workspaceGitInput"]', [browser.Keys.SPACE, browser.Keys.BACK_SPACE])
      .waitForElementPresent('[data-id="workspaceGit-main"]')
      .click('[data-id="workspaceGit-main"]')
      .pause(2000)
      .waitForElementNotPresent('[data-id="treeViewDivtreeViewItemdev.ts"]')
      .waitForElementPresent('[data-id="treeViewDivtreeViewItemmain.ts"]')
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .expect.element('[data-id="workspaceGit-main"]').text.to.contain('✓ ')
  },

  'Should prevent checkout to a branch if local changes exists #group3': function (browser: NightwatchBrowser) {
    browser
      .renamePath('README.md', 'README.txt', 'README.txt')
      .waitForElementVisible('[data-id="workspaceGitBranchesDropdown"]')
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .waitForElementVisible('[data-id="workspaceGit-dev"]')
      .click('[data-id="workspaceGit-dev"]')
      .waitForElementVisible('[data-id="switchBranchModalDialogContainer-react"]')
      .waitForElementContainsText('[data-id="switchBranchModalDialogModalBody-react"]', 'Your local changes to the following files would be overwritten by checkout.')
      .click('[data-id="switchBranchModalDialogModalFooter-react"]')
      .click('[data-id="switchBranch-modal-footer-cancel-react"]')
      .pause(2000)
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .expect.element('[data-id="workspaceGit-main"]').text.to.contain('✓ ')
  },

  'Should force checkout to a branch with exisiting local changes #group3': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[data-id="workspaceGit-dev"]')
      .click('[data-id="workspaceGit-dev"]')
      .waitForElementVisible('[data-id="switchBranchModalDialogContainer-react"]')
      .waitForElementContainsText('[data-id="switchBranchModalDialogModalBody-react"]', 'Your local changes to the following files would be overwritten by checkout.')
      .click('[data-id="switchBranchModalDialogModalFooter-react"]')
      .click('[data-id="switchBranch-modal-footer-ok-react"]')
      .pause(2000)
      .click('[data-id="workspaceGitBranchesDropdown"]')
      .expect.element('[data-id="workspaceGit-dev"]').text.to.contain('✓ ')
  },

  // GIT BRANCHES E2E END

  tearDown: sauce
}