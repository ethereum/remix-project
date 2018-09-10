var yo = require('yo-yo')
var async = require('async')
var helper = require('../../lib/helper.js')
var tooltip = require('../ui/tooltip')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var globalRegistry = require('../../global/registry')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')

module.exports = class TestTab {
  constructor (localRegistry) {
    const self = this
    self._view = { el: null }
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    // dependencies
    self._deps = {
      fileManager: self._components.registry.get('filemanager').api,
      app: self._components.registry.get('app').api,
      filePanel: self._components.registry.get('filepanel').api
    }
    self.data = {}
    self.testList = yo`<div class=${css.testList}></div>`
  }
  render () {
    const self = this
    var testsOutput = yo`<div class=${css.container} hidden='true' id="tests"></div>`
    var testsSummary = yo`<div class=${css.container} hidden='true' id="tests"></div>`

    var testCallback = function (result) {
      testsOutput.hidden = false
      if (result.type === 'contract') {
        testsOutput.appendChild(yo`<div class=${css.outputTitle}>${result.filename} (${result.value})</div>`)
      } else if (result.type === 'testPass') {
        testsOutput.appendChild(yo`<div class='${css.testPass} ${css.testLog}'>✓ (${result.value})</div>`)
      } else if (result.type === 'testFailure') {
        testsOutput.appendChild(yo`<div class='${css.testFailure} ${css.testLog}'>✘ (${result.value})</div>`)
      }
    }

    var resultsCallback = function (_err, result, cb) {
      // total stats for the test
      // result.passingNum
      // result.failureNum
      // result.timePassed
      cb()
    }

    var updateFinalResult = function (_err, result, filename) {
      testsSummary.hidden = false
      if (_err) {
        testsSummary.appendChild(yo`<div class=${css.testFailureSummary} >${_err.message}</div>`)
        return
      }
      testsSummary.appendChild(yo`<div class=${css.summaryTitle}> ${filename} </div>`)
      if (result.totalPassing > 0) {
        testsSummary.appendChild(yo`<div>${result.totalPassing} passing (${result.totalTime}s)</div>`)
        testsSummary.appendChild(yo`<br>`)
      }
      if (result.totalFailing > 0) {
        testsSummary.appendChild(yo`<div>${result.totalFailing} failing</div>`)
        testsSummary.appendChild(yo`<br>`)
      }
      result.errors.forEach((error, index) => {
        testsSummary.appendChild(yo`<div>${error.context} - ${error.value} </div>`)
        testsSummary.appendChild(yo`<div class=${css.testFailureSummary} >${error.message}</div>`)
        testsSummary.appendChild(yo`<br>`)
      })
    }

    function runTest (testFilePath, callback) {
      self._deps.fileManager.fileProviderOf(testFilePath).get(testFilePath, (error, content) => {
        if (!error) {
          var runningTest = {}
          runningTest[testFilePath] = { content }
          remixTests.runTestSources(runningTest, testCallback, resultsCallback, (error, result) => {
            updateFinalResult(error, result, testFilePath)
            callback(error)
          }, (url, cb) => { self._deps.app.importFileCb(url, cb) })
        }
      })
    }

    function getTests (self, cb) {
      var path = self._deps.fileManager.currentPath()
      var provider = self._deps.fileManager.fileProviderOf(path)
      var tests = []
      self._deps.fileManager.filesFromPath(path, (error, files) => {
        if (error) return cb(error)
        if (!error) {
          for (var file in files) {
            if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
          }
          cb(null, tests)
        }
      })
    }

    self._deps.filePanel.event.register('newTestFileCreated', file => {
      var testList = document.querySelector("[class^='testList']")
      var test = yo`<label><input onchange=${(e) => toggleCheckbox(e, file)} type="checkbox" checked="true">${file}</label>`
      testList.appendChild(test)
      self.data.allTests.push(file)
      self.data.selectedTests.push(file)
    })

    self._deps.fileManager.event.register('currentFileChanged', (file, provider) => {
      getTests(self, (error, tests) => {
        if (error) return tooltip(error)
        self.data.allTests = tests
        self.data.selectedTests = [...self.data.allTests]
        if (!tests.length) {
          yo.update(self.testList, yo`<div class=${css.testList}>No test file available</div>`)
        } else {
          yo.update(self.testList, yo`<div class=${css.testList}>${listTests()}</div>`)
        }
        testsOutput.hidden = true
        testsSummary.hidden = true
        testsOutput.innerHTML = ''
        testsSummary.innerHTML = ''
      })
    })

    // self._events.filePanel.register('fileRenamed', (oldName, newName, isFolder) => {
    //   debugger
    //   self.data.allTests = self.data.allTests.filter(e => e != oldName)
    //   self.data.selectedTests = self.data.selectedTests.filter(e => e !== oldName)
    //   if (/.(_test.sol)$/.exec(newName)) self.data.allTests.push(newName)
    // })

    function listTests () {
      var tests = self.data.allTests
      return tests.map(test => yo`<label><input onchange =${(e) => toggleCheckbox(e, test)} type="checkbox" checked="true">${test} </label>`)
    }

    function toggleCheckbox (e, test) {
      var selectedTests = self.data.selectedTests
      selectedTests = e.target.checked ? [...selectedTests, test] : selectedTests.filter(el => el !== test)
      self.data.selectedTests = selectedTests
    }

    var runTests = function () {
      testsOutput.innerHTML = ''
      testsSummary.innerHTML = ''
      var tests = self.data.selectedTests
      async.eachOfSeries(tests, (value, key, callback) => { runTest(value, callback) })
    }

    var generateTestFile = function () {
      var fileManager = self._deps.fileManager
      var path = fileManager.currentPath()
      var fileProvider = fileManager.fileProviderOf(path)
      if (fileProvider) {
        helper.createNonClashingNameWithPrefix(path + '/test.sol', fileProvider, '_test', (error, newFile) => {
          if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
          if (!fileProvider.set(newFile, testContractSample)) {
            modalDialogCustom.alert('Failed to create test file ' + newFile)
          } else {
            fileManager.switchFile(newFile)
          }
        })
      }
    }

    var el = yo`
      <div class="${css.testTabView}" id="testView">
        <div class="${css.infoBox}">
        <div class="${css.title}">Unit Testing</div>
          Test your smart contract by creating a foo_test.sol file (open ballot_test.sol to see the example).
          <br/>
          You will find more informations in the <a href="https://remix.readthedocs.io/en/latest/unittesting_tab.html">documentation</a>
          Then use the stand alone NPM module remix-tests to run unit tests in your Continuous Integration
          <a href="https://www.npmjs.com/package/remix-tests">https://www.npmjs.com/package/remix-tests</a>.
          <br/>
          For more details, see
          How to test smart contracts guide in our documentation.
          <div class=${css.generateTestFile} onclick=${generateTestFile}>Generate test file</div>
        </div>
        <div class="${css.tests}">
          ${self.testList}
          <div class=${css.buttons}>
            <div class=${css.runButton} onclick=${runTests}>Run Tests</div>
          </div>
          ${testsOutput}
          ${testsSummary}
        </div>
      </div>
    `
    if (!self._view.el) self._view.el = el
    return el
  }
}

var testContractSample = `pragma solidity ^0.4.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.

// file name has to end with '_test.sol'
contract test_1 {
    
    function beforeAll () {
      // here should instanciate tested contract
    }
    
    function check1 () public {
      // this function is not constant, use 'Assert' to test the contract
      Assert.equal(uint(2), uint(1), "error message");
      Assert.equal(uint(2), uint(2), "error message");
    }
    
    function check2 () public constant returns (bool) {
      // this function is constant, use the return value (true or false) to test the contract
      return true;
    }
}

contract test_2 {
   
    function beforeAll () {
      // here should instanciate tested contract
    }
    
    function check1 () public {
      // this function is not constant, use 'Assert' to test the contract
      Assert.equal(uint(2), uint(1), "error message");
      Assert.equal(uint(2), uint(2), "error message");
    }
    
    function check2 () public constant returns (bool) {
      // this function is constant, use the return value (true or false) to test the contract
      return true;
    }
}`
