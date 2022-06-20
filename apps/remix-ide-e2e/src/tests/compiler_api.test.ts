'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import examples from '../examples/example-contracts'

const sources = [
  { 'Untitled.sol': { content: examples.ballot.content } }
]

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should compile using "compileWithParamaters" API #group1': function (browser: NightwatchBrowser) {
    browser
      .addFile('test_jsCompile.js', { content: jsCompile })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '"languageversion":"0.6.8+commit.0bbfe453"', 60000)
      .click('*[data-id="terminalClearConsole"]')
  },

  'Should compile using "compileWithParamaters" API with optimization On #group2': function (browser: NightwatchBrowser) {
    browser
      .addFile('test_jsCompileWithOptimization.js', { content: jsCompileWithOptimization })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '\\"optimizer\\":{\\"enabled\\":true,\\"runs\\":300}', 60000)
      .click('*[data-id="terminalClearConsole"]')
  },

  'Should compile using "compileWithParamaters" API with optimization off check default runs #group3': function (browser: NightwatchBrowser) {
    browser
      .addFile('test_jsCompileWithOptimizationDefault.js', { content: jsCompileWithOptimizationDefault })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '\\"optimizer\\":{\\"enabled\\":false,\\"runs\\":200}', 60000)
      .click('*[data-id="terminalClearConsole"]')
  },

  'Should update the compiler configuration with "setCompilerConfig" API #group4': function (browser: NightwatchBrowser) {
    browser
      .addFile('test_updateConfiguration.js', { content: updateConfiguration })
      .executeScript('remix.exeCurrent()')
      .pause(15000)
      .addFile('test_updateConfiguration.sol', { content: simpleContract })
      .verifyContracts(['StorageTestUpdateConfiguration'], { wait: 5000, version: '0.6.8+commit.0bbfe453' })
  },

  'Should produce a stack too deep error #group5': function (browser: NightwatchBrowser) {
    browser
      .setSolidityCompilerVersion('soljson-v0.8.1+commit.df193b15.js')
      .addFile('ContractStackLimit.sol', { content: contractStackLimit })
      .clickLaunchIcon('solidity')
      .waitForElementContainsText('*[data-id="compiledErrors"]', 'CompilerError: Stack too deep when compiling inline assembly: Variable headStart is 1 slot(s) too deep inside the stack.', 60000)
      .end()
  }
}

const simpleContract = `pragma solidity >=0.4.22 <0.9.1;

/**
* @title Storage
* @dev Store & retreive value in a variable
*/
contract StorageTestUpdateConfiguration {

  uint256 number;

  /**
   * @dev Store value in variable
   * @param num value to store
   */
  function store(uint256 num) public {
      number = num;
  }

  /**
   * @dev Return value 
   * @return value of 'number'
   */
  function retreive() public view returns (uint256){
      return number;
  }
}
          
          `

const jsCompile = `(async () => {
    
  try {
      const contract = {
          "storage.sol": {content : \`${simpleContract}\` }
      }
      console.log('compile')
      const params = {
          optimize: false,
          evmVersion: null,
          language: 'Solidity',
          version: '0.6.8+commit.0bbfe453'
      }
      const result = await remix.call('solidity', 'compileWithParameters', contract, params)
      console.log('result ', result)
  } catch (e) {
      console.log(e.message)
  }
})()`

const jsCompileWithOptimization = `(async () => {
  try {
      const contract = {
          "storage.sol": {content : \`${simpleContract}\` }
      }
      console.log('compile')
      const params = {
          optimize: true,
          runs: 300,
          evmVersion: null,
          language: 'Solidity',
          version: '0.6.8+commit.0bbfe453'
      }
      const result = await remix.call('solidity', 'compileWithParameters', contract, params)
      console.log('result ', result)
  } catch (e) {
      console.log(e.message)
  }
})()`

const jsCompileWithOptimizationDefault = `(async () => {
  try {
      const contract = {
          "storage.sol": {content : \`${simpleContract}\` }
      }
      console.log('compile')
      const params = {
          optimize: false,
      }
      const result = await remix.call('solidity', 'compileWithParameters', contract, params)
      console.log('result ', result)
  } catch (e) {
      console.log(e.message)   
  }
})()`

const updateConfiguration = `(async () => {
  try {    
      const params = {
          optimize: false,
          evmVersion: null,
          language: 'Solidity',
          version: '0.6.8+commit.0bbfe453'
      }
      await remix.call('solidity', 'setCompilerConfig', params)
  } catch (e) {
      console.log(e.message)   
  }
})()`

const contractStackLimit = `
//SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.1;
contract DoesNotCompile {    
    uint u;
    function fStackLimit(uint u1, uint u2, uint u3, uint u4, uint u5, uint u6, uint u7, uint u8, uint u9, uint u10, uint u11, uint u12) public {        
    }
}`

