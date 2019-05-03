var yo = require('yo-yo')
var async = require('async')
var tooltip = require('../ui/tooltip')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')
import { BaseApi } from 'remix-plugin'

const TestTabLogic = require('./testTab/testTab')

const profile = {
  name: 'solidityUnitTesting',
  displayName: 'Solidity unit testing',
  methods: [],
  events: [],
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH4wUDEhQZ0zbrmQAAAfNJREFUWMPF17lrFVEUx/EPaIKovfAScSndjUtULFQSYhHF0r/Dwsa/RywUiTaWgvaChWsiKkSMZte4o7G5A49x7r0zLy/PA6eZOef3PXebuYfu2xCmcQ9b9NgOYw6rwR9ia6/gR7HQBi/8PjavN/w4FivghV9bT/gwlhLwHzjTVPQ8rqAvE3ciA/+O8abwy/gVBG4lijiJ5czIL64FXvhNbCzFnaoBv9AUPo7fEcEb2BDiTuNTAv4NYxX6u/EIM7GZuZoQXcX1sJk+J2K+YrRCexfetsX9xKVyUB9uZ4r4k3j3BSMR+JvIMv2zQfsxkSkiBj9XAd8ZgRf+vmop+nGnAXwlcs534HUm93FsQ9YtIjby7XiVyZ3BntSpyBWxgrMR+FQG/gF76xzNftxtMO1rgo+G5AdBqLBN4d9eCCyHD1En8Oi0j4UPSBE4hcFSERN4Fz7BZRvEZKcjHynBC5/EQI1lGqgJ3xcTmE4kvswUMRBiUvCPKTg8zQi8QKsirxXe5eD7c1N4ALMZoeelIlrhWSpnNmjXsoM1iihmYhueZGIXcKTp7/hQ6UZb5c+Cp2LmglZHVqeIlC+G2/GarNMiFnGsWzfdpkV0Fd7e5czXgC+FvmDdWq35/wVvbzbnI/DhXvV9Q6W+r6fw9hZsKnjX4H8B0Aamri7CrBsAAAAASUVORK5CYII=',
  description: 'Fast tool to generate unit tests for your contracts',
  location: 'swapPanel'
}

module.exports = class TestTab extends BaseApi {
  constructor (fileManager, filePanel, compileTab) {
    super(profile)
    this.compileTab = compileTab
    this._view = { el: null }
    this.compileTab = compileTab
    this.fileManager = fileManager
    this.filePanel = filePanel
    this.testTabLogic = new TestTabLogic(fileManager)
    this.data = {}
    this.testList = yo`<div class=${css.testList}></div>`
  }

  activate () {
    this.listenToEvents()
  }

  deactivate () {
  }

  listenToEvents () {
    this.filePanel.event.register('newTestFileCreated', file => {
      var testList = this.view.querySelector("[class^='testList']")
      var test = yo`<label class="singleTestLabel"><input class="singleTest" onchange=${(e) => this.toggleCheckbox(e.target.checked, file)} type="checkbox" checked="true">${file}</label>`
      testList.appendChild(test)
      this.data.allTests.push(file)
      this.data.selectedTests.push(file)
    })

    this.fileManager.events.on('currentFileChanged', (file, provider) => {
      this.testTabLogic.getTests((error, tests) => {
        if (error) return tooltip(error)
        this.data.allTests = tests
        this.data.selectedTests = [...this.data.allTests]

        const testsMessage = (tests.length ? this.listTests() : 'No test file available')
        yo.update(this.testList, yo`<div class=${css.testList}>${testsMessage}</div>`)

        if (!this.testsOutput || !this.testsSummary) return

        this.testsOutput.hidden = true
        this.testsSummary.hidden = true
        this.testsOutput.innerHTML = ''
        this.testsSummary.innerHTML = ''
      })
    })
  }

  listTests () {
    return this.data.allTests.map(test => yo`<label class="singleTestLabel"><input class="singleTest" onchange =${(e) => this.toggleCheckbox(e.target.checked, test)} type="checkbox" checked="true">${test} </label>`)
  }

  toggleCheckbox (eChecked, test) {
    if (!this.data.selectedTests) {
      this.data.selectedTests = this._view.el.querySelectorAll('.singleTest:checked')
    }
    let selectedTests = this.data.selectedTests
    selectedTests = eChecked ? [...selectedTests, test] : selectedTests.filter(el => el !== test)
    this.data.selectedTests = selectedTests
    let checkAll = this._view.el.querySelector('[id="checkAllTests"]')
    if (eChecked) {
      checkAll.checked = true
    } else if (!selectedTests.length) {
      checkAll.checked = false
    }
  }

  checkAll (event) {
    let checkBoxes = this._view.el.querySelectorAll('.singleTest')
    const checkboxesLabels = this._view.el.querySelectorAll('.singleTestLabel')
    // checks/unchecks all
    for (let i = 0; i < checkBoxes.length; i++) {
      checkBoxes[i].checked = event.target.checked
      this.toggleCheckbox(event.target.checked, checkboxesLabels[i].innerText)
    }
  }

  testCallback (result) {
    this.testsOutput.hidden = false
    if (result.type === 'contract') {
      this.testsOutput.appendChild(yo`<div class=${css.outputTitle}>${result.filename} (${result.value})</div>`)
    } else if (result.type === 'testPass') {
      this.testsOutput.appendChild(yo`<div class="${css.testPass} ${css.testLog} bg-success">✓ (${result.value})</div>`)
    } else if (result.type === 'testFailure') {
      this.testsOutput.appendChild(yo`<div class="${css.testFailure} ${css.testLog} bg-danger">✘ (${result.value})</div>`)
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
    this.testsSummary.hidden = false
    if (_err) {
      this.testsSummary.appendChild(yo`<div class="${css.testFailureSummary} text-danger" >${_err.message}</div>`)
      return
    }
    this.testsSummary.appendChild(yo`<div class=${css.summaryTitle}> ${filename} </div>`)
    if (result.totalPassing > 0) {
      this.testsSummary.appendChild(yo`<div class="text-success" >${result.totalPassing} passing (${result.totalTime}s)</div>`)
      this.testsSummary.appendChild(yo`<br>`)
    }
    if (result.totalFailing > 0) {
      this.testsSummary.appendChild(yo`<div class="text-danger" >${result.totalFailing} failing</div>`)
      this.testsSummary.appendChild(yo`<br>`)
    }
    result.errors.forEach((error, index) => {
      this.testsSummary.appendChild(yo`<div class="text-danger" >${error.context} - ${error.value} </div>`)
      this.testsSummary.appendChild(yo`<div class="${css.testFailureSummary} text-danger" >${error.message}</div>`)
      this.testsSummary.appendChild(yo`<br>`)
    })
  }

  runTest (testFilePath, callback) {
    this.loading.hidden = false
    this.fileManager.fileProviderOf(testFilePath).get(testFilePath, (error, content) => {
      if (error) return
      var runningTest = {}
      runningTest[testFilePath] = { content }
      remixTests.runTestSources(runningTest, (result) => { this.testCallback(result) }, (_err, result, cb) => { this.resultsCallback(_err, result, cb) }, (error, result) => {
        this.updateFinalResult(error, result, testFilePath)
        this.loading.hidden = true
        callback(error)
      }, (url, cb) => {
        return this.compileTab.compileTabLogic.importFileCb(url, cb)
      })
    })
  }

  runTests () {
    this.loading.hidden = false
    this.testsOutput.innerHTML = ''
    this.testsSummary.innerHTML = ''
    var tests = this.data.selectedTests
    async.eachOfSeries(tests, (value, key, callback) => { this.runTest(value, callback) })
  }

  render () {
    this.testsOutput = yo`<div class="${css.container} border border-primary border-right-0 border-left-0 border-bottom-0"  hidden='true' id="tests"></div>`
    this.testsSummary = yo`<div class="${css.container} border border-primary border-right-0 border-left-0 border-bottom-0" hidden='true' id="tests"></div>`
    this.loading = yo`<span class='text-info ml-1'>Running tests...</span>`
    this.loading.hidden = true
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
          <div class="${css.generateTestFile} btn btn-primary m-1" onclick="${this.testTabLogic.generateTestFile.bind(this.testTabLogic)}">Generate test file</div>
        </div>
        <div class="${css.tests}">          
          <div class="${css.buttons}">
            <div class="${css.runButton} btn btn-primary m-1"  onclick="${this.runTests.bind(this)}">Run Tests</div>
            <label class="${css.label}" for="checkAllTests">
              <input id="checkAllTests"
                type="checkbox"
                onclick="${(event) => { this.checkAll(event) }}"
                checked="true"
              >
              Check/Uncheck all
            </label>
          </div>
          ${this.testList}
          <hr>
          <div class="${css.buttons}" ><h6>Results:${this.loading}</h6></div>
          ${this.testsOutput}
          ${this.testsSummary}
        </div>
      </div>
    `
    if (!this._view.el) this._view.el = el
    return el
  }

}
