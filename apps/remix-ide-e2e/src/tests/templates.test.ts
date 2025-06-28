'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const templatesToCheck = [
    {
        value: "remixDefault",
        displayName: "Basic",
        checkSelectors: [
            '*[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]',
            '*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]'
        ]
    },
    {
        value: "blank",
        displayName: "Blank",
        checkSelectors: ['*[data-id="treeViewLitreeViewItem.prettierrc.json"]']
    },
    {
        value: "simpleEip7702",
        displayName: "Simple EIP-7702",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/Example7702.sol"]']
    },
    {
        value: "introToEIP7702",
        displayName: "Intro to EIP-7702",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/Spender.sol"]']
    },
    {
        value: "accountAbstraction",
        displayName: "Account Abstraction",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemfunding.json"]']
    },
    {
        value: "ozerc20",
        displayName: "ERC20",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]'],
        clickOk: true
    },
    {
        value: "ozerc721",
        displayName: "ERC721",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]'],
        clickOk: true
    },
    {
        value: "ozerc1155",
        displayName: "ERC1155",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]'],
        clickOk: true
    },
    {
        value: "zeroxErc20",
        displayName: "ERC20",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/SampleERC20.sol"]']
    },
    {
        value: "gnosisSafeMultisig",
        displayName: "MultiSig",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcontracts/MultisigWallet.sol"]']
    },
    {
        value: "semaphore",
        displayName: "Semaphore",
        checkSelectors: ['*[data-id="treeViewLitreeViewItemcircuits/semaphore.circom"]']
    },
    {
        value: "hashchecker",
        displayName: "Hash",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemcircuits/calculate_hash.circom"]']
    },
    {
        value: "rln",
        displayName: "Rate",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemcircuits/rln.circom"]']
    },
    {
        value: "multNr",
        displayName: "Multiplier",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemsrc/main.nr"]']
    },
    {
        value: "sindriScripts",
        displayName: "Add Sindri ZK scripts",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemscripts/sindri/run_compile.ts"]']
    },
    {
        value: "uniswapV4Template",
        displayName: "v4 Template",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemfoundry.toml"]']
    },
    {
        value: "contractCreate2Factory",
        displayName: "Add Create2 Solidity factory",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemcontracts/libs/create2-factory.sol"]']
    },
    {
        value: "contractDeployerScripts",
        displayName: "Add contract deployer scripts",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemscripts/contract-deployer/basic-contract-deploy.ts"]']
    },
    {
        value: "etherscanScripts",
        displayName: "Add Etherscan scripts",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItemscripts/etherscan/receiptGuidScript.ts"]']
    },
    {
        value: "runJsTestAction",
        displayName: "Mocha Chai Test Workflow",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItem.github/workflows/run-js-test.yml"]']
    },
    {
        value: "runSolidityUnittestingAction",
        displayName: "Solidity Test Workflow",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItem.github/workflows/run-solidity-unittesting.yml"]']
    },
    {
        value: "runSlitherAction",
        displayName: "Slither Workflo",
        checkSelectors: ['*[data-id="treeViewDivtreeViewItem.github/workflows/run-slither-action.yml"]']
    }
]

function setTemplateOptions(browser: NightwatchBrowser, opts: { [key: string]: any }) {
    if (opts.mintable) browser.click('*[data-id="featureTypeMintable"]')
    if (opts.burnable) browser.click('*[data-id="featureTypeBurnable"]')
    if (opts.pausable) browser.click('*[data-id="featureTypePausable"]')
    if (opts.upgradeability === 'transparent') browser.click('*[data-id="upgradeTypeTransparent"]')
    if (opts.upgradeability === 'uups') browser.click('*[data-id="upgradeTypeUups"]')
}

function openTemplatesExplorer(browser: NightwatchBrowser) {
    browser
        .click('*[data-id="workspacesMenuDropdown"]')
        .click('*[data-id="workspacecreate"]')
        .waitForElementPresent('*[data-id="create-remixDefault"]')
}

function runTemplateChecks(
    browser: NightwatchBrowser,
    start: number,
    end: number,
    mode: 'create' | 'add' = 'create',
) {
    templatesToCheck.slice(start, end).forEach(({ value, displayName, checkSelectors, clickOk }) => {
        console.log(`Checking template: ${value} in ${mode} mode`)
        openTemplatesExplorer(browser)

        if (mode === 'create') {
            browser
                .waitForElementVisible(`[data-id="create-${value}"]`, 5000)
                .click(`[data-id="create-${value}"]`)
        } else {
            browser
                .waitForElementVisible(`[data-id="create-blank"]`, 5000)
                .click(`[data-id="create-blank"]`)
        }

        browser
            .waitForElementVisible('*[data-id="TemplatesSelection-modal-footer-ok-react"]', 2000)
            .click('*[data-id="TemplatesSelection-modal-footer-ok-react"]')
            .pause(1000)

        if (mode === 'add') {
            browser.element('css selector', `[data-id="add-${value}"]`, result => {
                console.log(`Element add-${value} status: ${result.status}`)
                if (result.status == 0) {
                    openTemplatesExplorer(browser)
                    browser
                        .waitForElementVisible(`[data-id="add-${value}"]`, 5000)
                        .click(`[data-id="add-${value}"]`)
                    if (clickOk) {
                        browser
                            .waitForElementVisible('*[data-id="TemplatesSelection-modal-footer-ok-react"]', 2000)
                            .click('*[data-id="TemplatesSelection-modal-footer-ok-react"]')
                    }

                    checkSelectors.forEach(selector => {
                        console.log(`Checking selector: ${selector}`)
                        browser.waitForElementVisible(selector, 30000)
                    })
                }
            })
        } else {
            browser
                .useXpath()
                .waitForElementVisible(`//div[contains(@data-id, "dropdown-content") and contains(., "${displayName}")]`, 10000)
                .useCss()

            checkSelectors.forEach(selector => {
                console.log(`Checking selector: ${selector}`)
                browser.waitForElementVisible(selector, 30000)
            })
        }
    })
}

function testTemplateOptions(browser: NightwatchBrowser, mode: 'create' | 'add') {
    openTemplatesExplorer(browser)

    const selector = mode === 'create' ? '[data-id="create-ozerc20"]' : '[data-id="add-ozerc20"]'

    browser
        .waitForElementVisible(selector, 5000)
        .click(selector)

    browser
        .waitForElementVisible('*[data-id="TemplatesSelection-modal-footer-ok-react"]', 2000)

    // Simulate user selecting options
    setTemplateOptions(browser, { mintable: true, burnable: true, upgradeability: 'uups' })

    // Confirm selection
    browser
        .click('*[data-id="TemplatesSelection-modal-footer-ok-react"]')

    // Verify expected file was created
    browser
        .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]', 10000)
        .click('*[data-id="treeViewLitreeViewItemcontracts/MyToken.sol"]')
        .pause(1000)
        .getEditorValue(editorValue => {
            const expected = 'contract MyToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable, ERC20PermitUpgradeable, UUPSUpgradeable'
            if (editorValue.includes(expected)) {
                console.log(`✅ Template with options applied successfully (${mode})`)
                browser.assert.ok(true, `Template with options applied successfully (${mode})`)
            } else {
                browser.assert.fail(`❌ Template with options was not applied correctly (${mode})`)
            }
        })
}

const tests = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
    openFilePanel: function (browser: NightwatchBrowser) {
        browser.clickLaunchIcon('filePanel')
    },
    'Loop through templates and click create #group1': function (browser) {
        runTemplateChecks(browser, 0, templatesToCheck.length, 'create')
    },
    'Loop through templates and click add buttons #group1': function (browser) {
        runTemplateChecks(browser, 0, templatesToCheck.length, 'add')
    },
    'Test template options with create #group2': function (browser: NightwatchBrowser) {
        testTemplateOptions(browser, 'create')
    },

    'Test template options with add #group2': function (browser: NightwatchBrowser) {
        openTemplatesExplorer(browser)
        browser
            .waitForElementVisible(`[data-id="create-remixDefault"]`, 5000)
            .click(`[data-id="create-remixDefault"]`)
            .waitForElementVisible('*[data-id="TemplatesSelection-modal-footer-ok-react"]', 2000)
            .click('*[data-id="TemplatesSelection-modal-footer-ok-react"]')
            .pause(1000)

        testTemplateOptions(browser, 'add')
    }
}


module.exports = {} // browser.browserName.includes('chrome') ? {} : tests