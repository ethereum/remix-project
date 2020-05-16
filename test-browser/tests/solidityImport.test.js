'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Test Simple Contract': function (browser) {
    browser.testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['test1', 'test2'])
  },
  'Test Success Import': function (browser) {
    browser.addFile('Untitled1.sol', sources[1]['browser/Untitled1.sol'])
          .addFile('Untitled2.sol', sources[1]['browser/Untitled2.sol'])
          .switchFile('browser/Untitled1.sol')
          .verifyContracts(['test6', 'test4', 'test5'])
  },

  'Test Failed Import': function (browser) {
    browser.addFile('Untitled3.sol', sources[2]['browser/Untitled3.sol'])
          .clickLaunchIcon('solidity')
          .assert.containsText('#compileTabView .error pre', 'not found browser/Untitled11.sol')
  },

  'Test Github Import - from master branch': function (browser) {
    browser
          .setSolidityCompilerVersion('soljson-v0.6.2+commit.bacdbe57.js') // open-zeppelin moved to pragma ^0.6.0 (master branch)
          .addFile('Untitled4.sol', sources[3]['browser/Untitled4.sol'])
          .clickLaunchIcon('fileExplorers')
          .verifyContracts(['test7', 'ERC20', 'SafeMath'], {wait: 10000})
  },

  'Test Github Import - from other branch': function (browser) {
    browser
          .setSolidityCompilerVersion('soljson-v0.5.0+commit.1d4f565a.js') // switch back to 0.5.0 : release-v2.3.0 branch is not solidity 0.6 compliant
          .addFile('Untitled5.sol', sources[4]['browser/Untitled5.sol'])
          .clickLaunchIcon('fileExplorers')
          .verifyContracts(['test8', 'ERC20', 'SafeMath'], {wait: 10000})
  },

  'Test Github Import - no branch specified': function (browser) {
    browser
          .setSolidityCompilerVersion('soljson-v0.6.2+commit.bacdbe57.js') // open-zeppelin moved to pragma ^0.6.0 (master branch)
          .addFile('Untitled6.sol', sources[5]['browser/Untitled6.sol'])
          .clickLaunchIcon('fileExplorers')
          .verifyContracts(['test10', 'ERC20', 'SafeMath'], {wait: 10000})
  },

  'Test Github Import - raw URL': function (browser) {
    browser
          .addFile('Untitled7.sol', sources[6]['browser/Untitled7.sol'])
          .clickLaunchIcon('fileExplorers')
          .verifyContracts(['test11', 'ERC20', 'SafeMath'], {wait: 10000})
          .end()
  },
  tearDown: sauce
}

var sources = [
  {
    'browser/Untitled.sol': {content: 'contract test1 {} contract test2 {}'}
  },
  {
    'browser/Untitled1.sol': {content: 'import "./Untitled2.sol"; contract test6 {}'},
    'browser/Untitled2.sol': {content: 'contract test4 {} contract test5 {}'}
  },
  {
    'browser/Untitled3.sol': {content: 'import "./Untitled11.sol"; contract test6 {}'}
  },
  {
    'browser/Untitled4.sol': {content: 'import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol"; contract test7 {}'}
  },
  {
    'browser/Untitled5.sol': {content: 'import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.3.0/contracts/token/ERC20/ERC20.sol"; contract test8 {}'}
  },
  {
    'browser/Untitled6.sol': {content: 'import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol"; contract test10 {}'}
  },
  {
    'browser/Untitled7.sol': {content: 'import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol"; contract test11 {}'}
  }
]
