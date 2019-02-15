var yo = require('yo-yo')
var async = require('async')
var helper = require('../../lib/helper.js')
var tooltip = require('../ui/tooltip')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')

import { ApiFactory } from 'remix-plugin'

module.exports = class TestTab extends ApiFactory {
  constructor (fileManager, filePanel, compileTab) {
    super()
    this.compileTab = compileTab
    this._view = { el: null }
    this._components = {}
    this.fileManager = fileManager
    this.filePanel = filePanel
    this.data = {}
    this.testList = yo`<div class=${css.testList}></div>`
    this.listenToEvents()
  }

  get profile () {
    return {
      name: 'solidityUnitTesting',
      displayName: 'solidity unit testing',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMjMwNCIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMjMwNCAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNzI4IDQ0OGwtMzg0IDcwNGg3Njh6bS0xMjgwIDBsLTM4NCA3MDRoNzY4em04MjEtMTkycS0xNCA0MC00NS41IDcxLjV0LTcxLjUgNDUuNXYxMjkxaDYwOHExNCAwIDIzIDl0OSAyM3Y2NHEwIDE0LTkgMjN0LTIzIDloLTEzNDRxLTE0IDAtMjMtOXQtOS0yM3YtNjRxMC0xNCA5LTIzdDIzLTloNjA4di0xMjkxcS00MC0xNC03MS41LTQ1LjV0LTQ1LjUtNzEuNWgtNDkxcS0xNCAwLTIzLTl0LTktMjN2LTY0cTAtMTQgOS0yM3QyMy05aDQ5MXEyMS01NyA3MC05Mi41dDExMS0zNS41IDExMSAzNS41IDcwIDkyLjVoNDkxcTE0IDAgMjMgOXQ5IDIzdjY0cTAgMTQtOSAyM3QtMjMgOWgtNDkxem0tMTgxIDE2cTMzIDAgNTYuNS0yMy41dDIzLjUtNTYuNS0yMy41LTU2LjUtNTYuNS0yMy41LTU2LjUgMjMuNS0yMy41IDU2LjUgMjMuNSA1Ni41IDU2LjUgMjMuNXptMTA4OCA4ODBxMCA3My00Ni41IDEzMXQtMTE3LjUgOTEtMTQ0LjUgNDkuNS0xMzkuNSAxNi41LTEzOS41LTE2LjUtMTQ0LjUtNDkuNS0xMTcuNS05MS00Ni41LTEzMXEwLTExIDM1LTgxdDkyLTE3NC41IDEwNy0xOTUuNSAxMDItMTg0IDU2LTEwMHExOC0zMyA1Ni0zM3Q1NiAzM3E0IDcgNTYgMTAwdDEwMiAxODQgMTA3IDE5NS41IDkyIDE3NC41IDM1IDgxem0tMTI4MCAwcTAgNzMtNDYuNSAxMzF0LTExNy41IDkxLTE0NC41IDQ5LjUtMTM5LjUgMTYuNS0xMzkuNS0xNi41LTE0NC41LTQ5LjUtMTE3LjUtOTEtNDYuNS0xMzFxMC0xMSAzNS04MXQ5Mi0xNzQuNSAxMDctMTk1LjUgMTAyLTE4NCA1Ni0xMDBxMTgtMzMgNTYtMzN0NTYgMzNxNCA3IDU2IDEwMHQxMDIgMTg0IDEwNyAxOTUuNSA5MiAxNzQuNSAzNSA4MXoiLz48L3N2Zz4=',
      description: ' - '
    }
  }

  listenToEvents () {
    const self = this

    self.filePanel.event.register('newTestFileCreated', file => {
      var testList = self.view.querySelector("[class^='testList']")
      var test = yo`<label class="singleTestLabel"><input class="singleTest" onchange=${(e) => this.toggleCheckbox(e.target.checked, file)} type="checkbox" checked="true">${file}</label>`
      testList.appendChild(test)
      self.data.allTests.push(file)
      self.data.selectedTests.push(file)
    })

    self.fileManager.event.register('currentFileChanged', (file, provider) => {
      self.getTests(self, (error, tests) => {
        if (error) return tooltip(error)
        self.data.allTests = tests
        self.data.selectedTests = [...self.data.allTests]
        if (!tests.length) {
          yo.update(self.testList, yo`<div class=${css.testList}>No test file available</div>`)
        } else {
          yo.update(self.testList, yo`<div class=${css.testList}>${self.listTests()}</div>`)
        }

        if (!self.testsOutput || !self.testsSummary) return

        self.testsOutput.hidden = true
        self.testsSummary.hidden = true
        self.testsOutput.innerHTML = ''
        self.testsSummary.innerHTML = ''
      })
    })
  }

  getTests (self, cb) {
    var path = self.fileManager.currentPath()
    if (!path) return cb(null, [])
    var provider = self.fileManager.fileProviderOf(path)
    if (!provider) return cb(null, [])
    var tests = []
    self.fileManager.filesFromPath(path, (error, files) => {
      if (error) return cb(error)
      if (!error) {
        for (var file in files) {
          if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
        }
        cb(null, tests)
      }
    })
  }

  listTests () {
    const self = this
    var tests = self.data.allTests
    return tests.map(test => yo`<label class="singleTestLabel"><input class="singleTest" onchange =${(e) => self.toggleCheckbox(e.target.checked, test)} type="checkbox" checked="true">${test} </label>`)
  }

  toggleCheckbox (eChecked, test) {
    const self = this
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

  checkAll (event) {
    const self = this
    let checkBoxes = self._view.el.querySelectorAll('.singleTest')
    const checkboxesLabels = self._view.el.querySelectorAll('.singleTestLabel')
    // checks/unchecks all
    for (let i = 0; i < checkBoxes.length; i++) {
      checkBoxes[i].checked = event.target.checked
      self.toggleCheckbox(event.target.checked, checkboxesLabels[i].innerText)
    }
  }

  testCallback (result) {
    const self = this
    self.testsOutput.hidden = false
    if (result.type === 'contract') {
      self.testsOutput.appendChild(yo`<div class=${css.outputTitle}>${result.filename} (${result.value})</div>`)
    } else if (result.type === 'testPass') {
      self.testsOutput.appendChild(yo`<div class='${css.testPass} ${css.testLog}'>✓ (${result.value})</div>`)
    } else if (result.type === 'testFailure') {
      self.testsOutput.appendChild(yo`<div class='${css.testFailure} ${css.testLog}'>✘ (${result.value})</div>`)
    }
  }

  resultsCallback (_err, result, cb) {
    // total stats for the test
    // result.passingNum
    // result.failureNum
    // result.timePassed
    cb()
  }

  updateFinalResult (_err, result, filename) {
    const self = this
    self.testsSummary.hidden = false
    if (_err) {
      self.testsSummary.appendChild(yo`<div class=${css.testFailureSummary} >${_err.message}</div>`)
      return
    }
    self.testsSummary.appendChild(yo`<div class=${css.summaryTitle}> ${filename} </div>`)
    if (result.totalPassing > 0) {
      self.testsSummary.appendChild(yo`<div>${result.totalPassing} passing (${result.totalTime}s)</div>`)
      self.testsSummary.appendChild(yo`<br>`)
    }
    if (result.totalFailing > 0) {
      self.testsSummary.appendChild(yo`<div>${result.totalFailing} failing</div>`)
      self.testsSummary.appendChild(yo`<br>`)
    }
    result.errors.forEach((error, index) => {
      self.testsSummary.appendChild(yo`<div>${error.context} - ${error.value} </div>`)
      self.testsSummary.appendChild(yo`<div class=${css.testFailureSummary} >${error.message}</div>`)
      self.testsSummary.appendChild(yo`<br>`)
    })
  }

  runTest (testFilePath, callback) {
    const self = this
    self.fileManager.fileProviderOf(testFilePath).get(testFilePath, (error, content) => {
      if (!error) {
        var runningTest = {}
        runningTest[testFilePath] = { content }
        remixTests.runTestSources(runningTest, self.testCallback, self.resultsCallback, (error, result) => {
          self.updateFinalResult(error, result, testFilePath)
          callback(error)
        }, (url, cb) => {
          return self.compileTab.compileTabLogic.importFileCb(url, cb)
        })
      }
    })
  }

  runTests () {
    const self = this
    self.testsOutput.innerHTML = ''
    self.testsSummary.innerHTML = ''
    var tests = self.data.selectedTests
    async.eachOfSeries(tests, (value, key, callback) => { self.runTest(value, callback) })
  }

  generateTestFile () {
    const self = this
    var fileManager = self.fileManager
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

  render () {
    const self = this
    this.testsOutput = yo`<div class=${css.container} hidden='true' id="tests"></div>`
    this.testsSummary = yo`<div class=${css.container} hidden='true' id="tests"></div>`

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
          <div class="${css.generateTestFile}" onclick="${self.generateTestFile(self)}">Generate test file</div>
        </div>
        <div class="${css.tests}">
          ${self.testList}
          <div class="${css.buttons}">
            <div class="${css.runButton}"  onclick="${self.runTests.bind(self)}">Run Tests</div>
            <label class="${css.label}" for="checkAllTests">
              <input id="checkAllTests"
                type="checkbox"
                onclick="${(event) => { this.checkAll(event) }}"
                checked="true"
              >
              Check/Uncheck all
            </label>
          </div>
          ${self.testsOutput}
          ${self.testsSummary}
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
