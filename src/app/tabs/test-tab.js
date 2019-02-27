var yo = require('yo-yo')
var async = require('async')
var helper = require('../../lib/helper.js')
var tooltip = require('../ui/tooltip')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var globalRegistry = require('../../global/registry')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')

module.exports = class TestTab {
  constructor (localRegistry, compileTab) {
    // TODO here is a direct reference to compile tab, should be removed
    const self = this
    self.compileTab = compileTab
    self._view = { el: null }
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    // dependencies
    self._deps = {
      fileManager: self._components.registry.get('filemanager').api,
      filePanel: self._components.registry.get('filepanel').api
    }
    self.data = {}
    self.testList = yo`<div class=${css.testList}></div>`
  }
  profile () {
    return {
      name: 'solidityUnitTesting',
      displayName: 'solidity unit testing',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMjMwNCIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMjMwNCAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNzI4IDQ0OGwtMzg0IDcwNGg3Njh6bS0xMjgwIDBsLTM4NCA3MDRoNzY4em04MjEtMTkycS0xNCA0MC00NS41IDcxLjV0LTcxLjUgNDUuNXYxMjkxaDYwOHExNCAwIDIzIDl0OSAyM3Y2NHEwIDE0LTkgMjN0LTIzIDloLTEzNDRxLTE0IDAtMjMtOXQtOS0yM3YtNjRxMC0xNCA5LTIzdDIzLTloNjA4di0xMjkxcS00MC0xNC03MS41LTQ1LjV0LTQ1LjUtNzEuNWgtNDkxcS0xNCAwLTIzLTl0LTktMjN2LTY0cTAtMTQgOS0yM3QyMy05aDQ5MXEyMS01NyA3MC05Mi41dDExMS0zNS41IDExMSAzNS41IDcwIDkyLjVoNDkxcTE0IDAgMjMgOXQ5IDIzdjY0cTAgMTQtOSAyM3QtMjMgOWgtNDkxem0tMTgxIDE2cTMzIDAgNTYuNS0yMy41dDIzLjUtNTYuNS0yMy41LTU2LjUtNTYuNS0yMy41LTU2LjUgMjMuNS0yMy41IDU2LjUgMjMuNSA1Ni41IDU2LjUgMjMuNXptMTA4OCA4ODBxMCA3My00Ni41IDEzMXQtMTE3LjUgOTEtMTQ0LjUgNDkuNS0xMzkuNSAxNi41LTEzOS41LTE2LjUtMTQ0LjUtNDkuNS0xMTcuNS05MS00Ni41LTEzMXEwLTExIDM1LTgxdDkyLTE3NC41IDEwNy0xOTUuNSAxMDItMTg0IDU2LTEwMHExOC0zMyA1Ni0zM3Q1NiAzM3E0IDcgNTYgMTAwdDEwMiAxODQgMTA3IDE5NS41IDkyIDE3NC41IDM1IDgxem0tMTI4MCAwcTAgNzMtNDYuNSAxMzF0LTExNy41IDkxLTE0NC41IDQ5LjUtMTM5LjUgMTYuNS0xMzkuNS0xNi41LTE0NC41LTQ5LjUtMTE3LjUtOTEtNDYuNS0xMzFxMC0xMSAzNS04MXQ5Mi0xNzQuNSAxMDctMTk1LjUgMTAyLTE4NCA1Ni0xMDBxMTgtMzMgNTYtMzN0NTYgMzNxNCA3IDU2IDEwMHQxMDIgMTg0IDEwNyAxOTUuNSA5MiAxNzQuNSAzNSA4MXoiLz48L3N2Zz4=',
      description: ' - '
    }
  }
  render () {
    const self = this
    var testsOutput = yo`<div class="${css.container} border border-primary border-right-0 border-left-0 border-bottom-0" hidden='true' id="tests"></div>`
    var testsSummary = yo`<div class="${css.container} border border-primary border-right-0 border-left-0 border-bottom-0" hidden='true' id="tests"></div>`

    var testCallback = function (result) {
      testsOutput.hidden = false
      if (result.type === 'contract') {
        testsOutput.appendChild(yo`<div class="${css.outputTitle}">${result.filename} (${result.value})</div>`)
      } else if (result.type === 'testPass') {
        testsOutput.appendChild(yo`<div class="${css.testPass} ${css.testLog} bg-success">✓ (${result.value})</div>`)
      } else if (result.type === 'testFailure') {
        testsOutput.appendChild(yo`<div class="${css.testFailure} ${css.testLog} bg-danger">✘ (${result.value})</div>`)
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
        testsSummary.appendChild(yo`<div class="${css.testFailureSummary} text-danger" >${_err.message}</div>`)
        return
      }
      testsSummary.appendChild(yo`<div class=${css.summaryTitle}> ${filename} </div>`)
      if (result.totalPassing > 0) {
        testsSummary.appendChild(yo`<div class="text-success">${result.totalPassing} passing (${result.totalTime}s)</div>`)
        testsSummary.appendChild(yo`<br>`)
      }
      if (result.totalFailing > 0) {
        testsSummary.appendChild(yo`<div class="text-danger" >${result.totalFailing} failing</div>`)
        testsSummary.appendChild(yo`<br>`)
      }
      result.errors.forEach((error, index) => {
        testsSummary.appendChild(yo`<div class="text-danger" >${error.context} - ${error.value} </div>`)
        testsSummary.appendChild(yo`<div class="${css.testFailureSummary} text-danger" >${error.message}</div>`)
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
          }, (url, cb) => { self.compileTab.compileTabLogic.importFileCb(url, cb) })
        }
      })
    }

    function getTests (self, cb) {
      var path = self._deps.fileManager.currentPath()
      if (!path) return cb(null, [])
      var provider = self._deps.fileManager.fileProviderOf(path)
      if (!provider) return cb(null, [])
      var tests = []
      self._deps.fileManager.getFilesFromPath(path)
        .then((files) => {
          for (var file in files) {
            if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
          }
          cb(null, tests)
        })
        .catch(err => cb(err))
    }

    self._deps.filePanel.event.register('newTestFileCreated', file => {
      var testList = self.view.querySelector("[class^='testList']")
      var test = yo`<label class="singleTestLabel"><input class="singleTest" onchange=${(e) => toggleCheckbox(e.target.checked, file)} type="checkbox" checked="true">${file}</label>`
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
      return tests.map(test => yo`<label class="singleTestLabel"><input class="singleTest" onchange =${(e) => toggleCheckbox(e.target.checked, test)} type="checkbox" checked="true">${test} </label>`)
    }

    function toggleCheckbox (eChecked, test) {
      if (!self.data.selectedTests) {
        self.data.selectedTests = self._view.el.querySelectorAll('.singleTest:checked')
      }
      let selectedTests = self.data.selectedTests
      selectedTests = eChecked ? [...selectedTests, test] : selectedTests.filter(el => el !== test)
      self.data.selectedTests = selectedTests
      let checkAll = self._view.el.querySelector('[id="checkAllTests"]')
      if (eChecked) {
        checkAll.checked = true
      } else if (!selectedTests.length) {
        checkAll.checked = false
      }
    }

    function checkAll (event) {
      let checkBoxes = self._view.el.querySelectorAll('.singleTest')
      const checkboxesLabels = self._view.el.querySelectorAll('.singleTestLabel')
      // checks/unchecks all
      for (let i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].checked = event.target.checked
        toggleCheckbox(event.target.checked, checkboxesLabels[i].innerText)
      }
    }

    var runTests = function () {
      testsOutput.innerHTML = 'Running tests ...'
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
      <div class="${css.testTabView} card" id="testView">
        <div class="${css.infoBox}">
          Test your smart contract by creating a foo_test.sol file (open ballot_test.sol to see the example).
          <br/>
          You will find more informations in the <a href="https://remix.readthedocs.io/en/latest/unittesting_tab.html">documentation</a>
          Then use the stand alone NPM module remix-tests to run unit tests in your Continuous Integration
          <a href="https://www.npmjs.com/package/remix-tests">https://www.npmjs.com/package/remix-tests</a>.
          <br/>
          For more details, see
          How to test smart contracts guide in our documentation.
          <br/>
          <button class="${css.generateTestFile} btn btn-primary m-1" onclick="${generateTestFile}">Generate test file</button>
        </div>
        <div class="${css.tests}">
          ${self.testList}
          <div class="${css.buttons} btn-group">
            <button class="${css.runButton} btn btn-primary m-1"  onclick="${runTests}">Run Tests</button>
            <label class="${css.label}" for="checkAllTests">
              <input id="checkAllTests"
                type="checkbox"
                onclick="${function (event) { checkAll(event) }}"
                checked="true"
              >
              Check/Uncheck all
            </label>
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

var testContractSample = `pragma solidity >=0.4.0 <0.6.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.

// file name has to end with '_test.sol'
contract test_1 {

  function beforeAll() public {
    // here should instantiate tested contract
    Assert.equal(uint(4), uint(3), "error in before all function");
  }

  function check1() public {
    // use 'Assert' to test the contract
    Assert.equal(uint(2), uint(1), "error message");
    Assert.equal(uint(2), uint(2), "error message");
  }

  function check2() public view returns (bool) {
    // use the return value (true or false) to test the contract
    return true;
  }
}

contract test_2 {
 
  function beforeAll() public {
    // here should instantiate tested contract
    Assert.equal(uint(4), uint(3), "error in before all function");
  }

  function check1() public {
    // use 'Assert' to test the contract
    Assert.equal(uint(2), uint(1), "error message");
    Assert.equal(uint(2), uint(2), "error message");
  }

  function check2() public view returns (bool) {
    // use the return value (true or false) to test the contract
    return true;
  }
}`
