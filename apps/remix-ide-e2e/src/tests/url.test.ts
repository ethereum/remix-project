'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import examples from '../examples/example-contracts'

const sources = [
  { 'Untitled.sol': { content: examples.ballot.content } },
  {
    'myTokenV1.sol': {
      content: `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.4;
      
      import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
      import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
      import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
      import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
      
      contract MyToken is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
          /// @custom:oz-upgrades-unsafe-allow constructor
          constructor() {
              _disableInitializers();
          }
      
          function initialize() initializer public {
              __ERC721_init("MyToken", "MTK");
              __Ownable_init();
              __UUPSUpgradeable_init();
          }
      
          function _authorizeUpgrade(address newImplementation)
              internal
              onlyOwner
              override
          {}
      }
        `
    }
  }
]

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080/#optimize=true&runs=300&evmVersion=istanbul&version=soljson-v0.7.4+commit.3f05b770.js', true)
  },

  '@sources': function () {
    return sources
  },

  'Should load the code from URL params (code param) #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('[for="autoCompile"]')
      .click('[for="autoCompile"]') // we set it too false in the local storage
      .pause(5000)
      .url('http://127.0.0.1:8080/#autoCompile=true&optimize=true&runs=300&evmVersion=istanbul&version=soljson-v0.7.4+commit.3f05b770.js&code=cHJhZ21hIHNvbGlkaXR5ID49MC42LjAgPDAuNy4wOwoKaW1wb3J0ICJodHRwczovL2dpdGh1Yi5jb20vT3BlblplcHBlbGluL29wZW56ZXBwZWxpbi1jb250cmFjdHMvYmxvYi9tYXN0ZXIvY29udHJhY3RzL2FjY2Vzcy9Pd25hYmxlLnNvbCI7Cgpjb250cmFjdCBHZXRQYWlkIGlzIE93bmFibGUgewogIGZ1bmN0aW9uIHdpdGhkcmF3KCkgZXh0ZXJuYWwgb25seU93bmVyIHsKICB9Cn0')
      .refresh() // we do one reload for making sure we already have the default workspace
      .pause(5000)
      .verify.elementPresent('[data-id="compilerContainerAutoCompile"]:checked')
      .click('[for="autoCompile"]') // we set it too false again
      .click('[for="autoCompile"]') // back to True in the local storage
      .assert.containsText('*[data-id="compilerContainerCompileBtn"]', 'contract-76747f6e19.sol')
      .clickLaunchIcon('filePanel')
      .currentWorkspaceIs('code-sample')
      .getEditorValue((content) => {
        browser.assert.ok(content && content.indexOf(
          'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol') !== -1,
          'code has not been loaded')
      })
  },

  'Should load the code from URL params (url param) #group1': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .url('http://127.0.0.1:8080/#optimize=true&runs=300&evmVersion=istanbul&version=soljson-v0.7.4+commit.3f05b770.js&url=https://github.com/ethereum/remix-project/blob/master/apps/remix-ide/contracts/app/solidity/mode.sol')
      .refresh() // we do one reload for making sure we already have the default workspace
      .pause(5000)
      .currentWorkspaceIs('code-sample')
      .getEditorValue((content) => {
        browser.assert.ok(content && content.indexOf(
          'proposals.length = _numProposals;') !== -1,
          'url has not been loaded')
      })
  },

  'Should load Etherscan verified contracts from URL "address" param) #group2': !function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .url('http://127.0.0.1:8080/#address=0x56db08fb78bc6689a1ef66efd079083fed0e4915')
      .refresh()
      .pause(7000)
      .currentWorkspaceIs('etherscan-code-sample')
      .assert.elementPresent('*[data-id=treeViewLitreeViewItemropsten]')
      .assert.elementPresent('*[data-id=treeViewLitreeViewItemrinkeby]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemrinkeby/0x56db08fb78bc6689a1ef66efd079083fed0e4915"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemrinkeby/0x56db08fb78bc6689a1ef66efd079083fed0e4915/Sample.sol"]')
      .getEditorValue((content) => {
        browser.assert.ok(content && content.indexOf(
          'contract Sample {') !== -1)
      })
      .url('http://127.0.0.1:8080/#address=0xdac17f958d2ee523a2206206994597c13d831ec7')
      .refresh()
      .pause(7000)
      .currentWorkspaceIs('etherscan-code-sample')
      .assert.elementPresent('*[data-id=treeViewLitreeViewItemmainnet]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemmainnet/0xdac17f958d2ee523a2206206994597c13d831ec7"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemmainnet/0xdac17f958d2ee523a2206206994597c13d831ec7/TetherToken.sol"]')
      .getEditorValue((content) => {
        browser.assert.ok(content && content.indexOf(
          'contract TetherToken is Pausable, StandardToken, BlackList {') !== -1)

      })
  },

  'Should load the code from URL & code params #group1': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .url('http://127.0.0.1:8080/#optimize=true&runs=300&evmVersion=istanbul&version=soljson-v0.7.4+commit.3f05b770.js&url=https://github.com/ethereum/remix-project/blob/master/apps/remix-ide/contracts/app/solidity/mode.sol&code=cHJhZ21hIHNvbGlkaXR5ID49MC42LjAgPDAuNy4wOwoKaW1wb3J0ICJodHRwczovL2dpdGh1Yi5jb20vT3BlblplcHBlbGluL29wZW56ZXBwZWxpbi1jb250cmFjdHMvYmxvYi9tYXN0ZXIvY29udHJhY3RzL2FjY2Vzcy9Pd25hYmxlLnNvbCI7Cgpjb250cmFjdCBHZXRQYWlkIGlzIE93bmFibGUgewogIGZ1bmN0aW9uIHdpdGhkcmF3KCkgZXh0ZXJuYWwgb25seU93bmVyIHsKICB9Cn0')
      .refresh() // we do one reload for making sure we already have the default workspace
      .pause(5000)
      .clickLaunchIcon('filePanel')
      .currentWorkspaceIs('code-sample')
      .getEditorValue((content) => {
        browser.assert.ok(content && content.indexOf(
          'proposals.length = _numProposals;') !== -1,
          'code has not been loaded')
      })
      .openFile('contract-76747f6e19.sol')
      .openFile('ethereum')
      .openFile('ethereum/remix-project')
      .openFile('ethereum/remix-project/apps')
      .openFile('ethereum/remix-project/apps/remix-ide')
      .openFile('ethereum/remix-project/apps/remix-ide/contracts')
      .openFile('ethereum/remix-project/apps/remix-ide/contracts/app')
      .openFile('ethereum/remix-project/apps/remix-ide/contracts/app/solidity')
      .openFile('ethereum/remix-project/apps/remix-ide/contracts/app/solidity/mode.sol')
  },

  'Should load the code from language & code params #group1': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .url('http://127.0.0.1:8080/#language=yul&version=soljson-v0.8.7+commit.e28d00a7.js&code=Ly8gQSBjb250cmFjdCBjb25zaXN0cyBvZiBhIHNpbmdsZSBvYmplY3Qgd2l0aCBzdWItb2JqZWN0cyByZXByZXNlbnRpbmcKLy8gdGhlIGNvZGUgdG8gYmUgZGVwbG95ZWQgb3Igb3RoZXIgY29udHJhY3RzIGl0IGNhbiBjcmVhdGUuCi8vIFRoZSBzaW5nbGUgImNvZGUiIG5vZGUgaXMgdGhlIGV4ZWN1dGFibGUgY29kZSBvZiB0aGUgb2JqZWN0LgovLyBFdmVyeSAob3RoZXIpIG5hbWVkIG9iamVjdCBvciBkYXRhIHNlY3Rpb24gaXMgc2VyaWFsaXplZCBhbmQKLy8gbWFkZSBhY2Nlc3NpYmxlIHRvIHRoZSBzcGVjaWFsIGJ1aWx0LWluIGZ1bmN0aW9ucyBkYXRhY29weSAvIGRhdGFvZmZzZXQgLyBkYXRhc2l6ZQovLyBUaGUgY3VycmVudCBvYmplY3QsIHN1Yi1vYmplY3RzIGFuZCBkYXRhIGl0ZW1zIGluc2lkZSB0aGUgY3VycmVudCBvYmplY3QKLy8gYXJlIGluIHNjb3BlLgpvYmplY3QgIkNvbnRyYWN0MSIgewogICAgLy8gVGhpcyBpcyB0aGUgY29uc3RydWN0b3IgY29kZSBvZiB0aGUgY29udHJhY3QuCiAgICBjb2RlIHsKICAgICAgICBmdW5jdGlvbiBhbGxvY2F0ZShzaXplKSAtPiBwdHIgewogICAgICAgICAgICBwdHIgOj0gbWxvYWQoMHg0MCkKICAgICAgICAgICAgaWYgaXN6ZXJvKHB0cikgeyBwdHIgOj0gMHg2MCB9CiAgICAgICAgICAgIG1zdG9yZSgweDQwLCBhZGQocHRyLCBzaXplKSkKICAgICAgICB9CgogICAgICAgIC8vIGZpcnN0IGNyZWF0ZSAiQ29udHJhY3QyIgogICAgICAgIGxldCBzaXplIDo9IGRhdGFzaXplKCJDb250cmFjdDIiKQogICAgICAgIGxldCBvZmZzZXQgOj0gYWxsb2NhdGUoc2l6ZSkKICAgICAgICAvLyBUaGlzIHdpbGwgdHVybiBpbnRvIGNvZGVjb3B5IGZvciBFVk0KICAgICAgICBkYXRhY29weShvZmZzZXQsIGRhdGFvZmZzZXQoIkNvbnRyYWN0MiIpLCBzaXplKQogICAgICAgIC8vIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBpcyBhIHNpbmdsZSBudW1iZXIgMHgxMjM0CiAgICAgICAgbXN0b3JlKGFkZChvZmZzZXQsIHNpemUpLCAweDEyMzQpCiAgICAgICAgcG9wKGNyZWF0ZShvZmZzZXQsIGFkZChzaXplLCAzMiksIDApKQoKICAgICAgICAvLyBub3cgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCAodGhlIGN1cnJlbnRseQogICAgICAgIC8vIGV4ZWN1dGluZyBjb2RlIGlzIHRoZSBjb25zdHJ1Y3RvciBjb2RlKQogICAgICAgIHNpemUgOj0gZGF0YXNpemUoIkNvbnRyYWN0MV9kZXBsb3llZCIpCiAgICAgICAgb2Zmc2V0IDo9IGFsbG9jYXRlKHNpemUpCiAgICAgICAgLy8gVGhpcyB3aWxsIHR1cm4gaW50byBhIG1lbW9yeS0+bWVtb3J5IGNvcHkgZm9yIEV3YXNtIGFuZAogICAgICAgIC8vIGEgY29kZWNvcHkgZm9yIEVWTQogICAgICAgIGRhdGFjb3B5KG9mZnNldCwgZGF0YW9mZnNldCgiQ29udHJhY3QxX2RlcGxveWVkIiksIHNpemUpCiAgICAgICAgcmV0dXJuKG9mZnNldCwgc2l6ZSkKICAgIH0KCiAgICBkYXRhICJUYWJsZTIiIGhleCI0MTIzIgoKICAgIG9iamVjdCAiQ29udHJhY3QxX2RlcGxveWVkIiB7CiAgICAgICAgY29kZSB7CiAgICAgICAgICAgIGZ1bmN0aW9uIGFsbG9jYXRlKHNpemUpIC0+IHB0ciB7CiAgICAgICAgICAgICAgICBwdHIgOj0gbWxvYWQoMHg0MCkKICAgICAgICAgICAgICAgIGlmIGlzemVybyhwdHIpIHsgcHRyIDo9IDB4NjAgfQogICAgICAgICAgICAgICAgbXN0b3JlKDB4NDAsIGFkZChwdHIsIHNpemUpKQogICAgICAgICAgICB9CgogICAgICAgICAgICAvLyBydW50aW1lIGNvZGUKCiAgICAgICAgICAgIG1zdG9yZSgwLCAiSGVsbG8sIFdvcmxkISIpCiAgICAgICAgICAgIHJldHVybigwLCAweDIwKQogICAgICAgIH0KICAgIH0KCiAgICAvLyBFbWJlZGRlZCBvYmplY3QuIFVzZSBjYXNlIGlzIHRoYXQgdGhlIG91dHNpZGUgaXMgYSBmYWN0b3J5IGNvbnRyYWN0LAogICAgLy8gYW5kIENvbnRyYWN0MiBpcyB0aGUgY29kZSB0byBiZSBjcmVhdGVkIGJ5IHRoZSBmYWN0b3J5CiAgICBvYmplY3QgIkNvbnRyYWN0MiIgewogICAgICAgIGNvZGUgewogICAgICAgICAgICAvLyBjb2RlIGhlcmUgLi4uCiAgICAgICAgfQoKICAgICAgICBvYmplY3QgIkNvbnRyYWN0Ml9kZXBsb3llZCIgewogICAgICAgICAgICBjb2RlIHsKICAgICAgICAgICAgICAgIC8vIGNvZGUgaGVyZSAuLi4KICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgZGF0YSAiVGFibGUxIiBoZXgiNDEyMyIKICAgIH0KfQ&optimize=false&runs=200&evmVersion=null')
      .refresh()
      .pause(5000)
      .clickLaunchIcon('filePanel')
      .currentWorkspaceIs('code-sample')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontract-eaa022e37e.yul"]', 6000)
      .openFile('contract-eaa022e37e.yul')
      .getEditorValue((content) => {
        browser.assert.ok(content && content.indexOf(
          'object "Contract1" {') !== -1)
      })
  },

  'Should select deploy with proxy option from URL params #group1': function (browser: NightwatchBrowser) {
    browser
      .url('http://127.0.0.1:8080/#optimize=false&runs=200&deployProxy=true')
      .refresh()
      .pause(5000)
      .switchWorkspace('default_workspace')
      .addFile('myTokenV1.sol', sources[1]['myTokenV1.sol'])
      .clickLaunchIcon('solidity')
      .pause(2000)
      .click('[data-id="compilerContainerCompileBtn"]')
      .waitForElementPresent('select[id="compiledContracts"] option[value=MyToken]', 60000)
      .clickLaunchIcon('udapp')
      .click('select.udapp_contractNames')
      .click('select.udapp_contractNames option[value=MyToken]')
      .waitForElementPresent('[data-id="contractGUIDeployWithProxyLabel"]')
      .expect.element('[data-id="contractGUIDeployWithProxy"]').to.be.selected
  },

  'Should select upgrade with proxy option from URL params #group1': function (browser: NightwatchBrowser) {
    browser
      .url('http://127.0.0.1:8080/#optimize=false&runs=200&upgradeProxy=true')
      .refresh()
      .pause(5000)
      .openFile('myTokenV1.sol')
      .clickLaunchIcon('solidity')
      .pause(2000)
      .click('[data-id="compilerContainerCompileBtn"]')
      .waitForElementPresent('select[id="compiledContracts"] option[value=MyToken]', 60000)
      .clickLaunchIcon('udapp')
      .click('select.udapp_contractNames')
      .click('select.udapp_contractNames option[value=MyToken]')
      .waitForElementPresent('[data-id="contractGUIUpgradeImplementationLabel"]')
      .expect.element('[data-id="contractGUIUpgradeImplementation"]').to.be.selected
  },

  'Should load using various URL compiler params #group1': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .url('http://127.0.0.1:8080/#optimize=true&runs=300&autoCompile=true&evmVersion=istanbul&version=soljson-v0.7.4+commit.3f05b770.js&language=Yul')
      .refresh()
      .pause(5000)
      .clickLaunchIcon('solidity')
      .click('*[data-id="scConfigExpander"]')
      .assert.containsText('#versionSelector option[data-id="selected"]', '0.7.4+commit.3f05b770')
      .assert.containsText('#evmVersionSelector option[data-id="selected"]', 'istanbul')
      .assert.containsText('#compilierLanguageSelector option[data-id="selected"]', 'Yul')
      .verify.elementPresent('#optimize:checked')
      .verify.elementPresent('#autoCompile:checked')
      .verify.attributeEquals('#runs', 'value', '300')
      .url('http://127.0.0.1:8080/#version=0.8.7')
      .refresh()
      .pause(5000)
      .clickLaunchIcon('solidity')
      .assert.containsText('#versionSelector option[data-id="selected"]', '0.8.7+commit.e28d00a7')
      .url('http://127.0.0.1:8080/#version=0.8.15+commit.e14f2714')
      .refresh()
      .pause(5000)
      .clickLaunchIcon('solidity')
      .assert.containsText('#versionSelector option[data-id="selected"]', '0.8.15+commit.e14f2714')
  },

  'Should load using compiler from link passed in remix URL #group1': function (browser: NightwatchBrowser) {
    browser
      .url('http://127.0.0.1:8080/#version=https://solidity-blog.s3.eu-central-1.amazonaws.com/data/08preview/soljson.js&optimize=false')
      .refresh()
      .pause(5000)
      .clickLaunchIcon('solidity')
      .pause(5000)
      .click('*[data-id="scConfigExpander"]')
      .assert.containsText('#versionSelector option[data-id="selected"]', 'custom')
      // default values
      .assert.containsText('#evmVersionSelector option[data-id="selected"]', 'default')
      .verify.elementPresent('#optimize')
      .assert.not.elementPresent('#optimize:checked')
      .verify.elementPresent('#runs:disabled')
      .click('[for="optimize"')
      .verify.attributeEquals('#runs', 'value', '200')
  },

  'Should load json files from link passed in remix URL #group1': function (browser: NightwatchBrowser) {
    browser
      .url('http://127.0.0.1:8080/#optimize=false&runs=200&evmVersion=null&version=soljson-v0.6.12+commit.27d51765.js&url=https://raw.githubusercontent.com/EthVM/evm-source-verification/main/contracts/1/0x011e5846975c6463a8c6337eecf3cbf64e328884/input.json')
      .refresh()
      .pause(5000)
      .switchWorkspace('code-sample')
      .openFile('@openzeppelin')
      .openFile('@openzeppelin/contracts')
      .openFile('@openzeppelin/contracts/access')
      .openFile('@openzeppelin/contracts/access/AccessControl.sol')
      .openFile('contracts')
      .openFile('contracts/governance')
      .openFile('contracts/governance/UnionGovernor.sol')
  },

  'Should execute function call from URL parameters #group1': function (browser: NightwatchBrowser) {
    browser
      .switchWorkspace('default_workspace')
      .url('http://127.0.0.1:8080?calls=fileManager//open//contracts/3_Ballot.sol///terminal//log//log')
      .refresh()
      .waitForElementVisible('*[data-shared="tooltipPopup"]')
      .waitForElementContainsText('*[data-shared="tooltipPopup"]', 'initiating fileManager and calling "open" ...')
      .waitForElementContainsText('*[data-shared="tooltipPopup"]', 'initiating terminal and calling "log" ...')
  }
}
