var yo = require('yo-yo')
var async = require('async')
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
      app: self._components.registry.get('app').api
    }
    self.data = {}
    self._view.el = self.render()
    self._deps.app.event.register('tabChanged', tabName => {
      if (tabName !== 'test') return
      yo.update(self._view.el, self.render())
      self._view.el.style.display = 'block'
    })

    return { render () { return self._view.el } }
  }
  render () {
    const self = this
    var testsOutput = yo`<div class=${css.container} hidden='true' id="tests"></div>`
    var testsSummary = yo`<div class=${css.container} hidden='true' id="tests"></div>`
    self.data.allTests = getTests()
    self.data.selectedTests = [...self.data.allTests]

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

    var updateFinalResult = function (_err, result) {
      testsSummary.hidden = false
      if (result.totalPassing > 0) {
        testsSummary.appendChild(yo`<div>${result.totalPassing} passing (${result.totalTime}s)</div>`)
      }
      if (result.totalFailing > 0) {
        testsSummary.appendChild(yo`<div>${result.totalFailing} failing</div>`)
      }
      result.errors.forEach((error, index) => {
        testsSummary.appendChild(yo`<div>${index + 1} ${error.context}} ${error.value} </div>`)
        testsSummary.appendChild(yo`<div></div>`)
        testsSummary.appendChild(yo`<div>error: ${error.message}</div>`)
      })
    }

    function runTest (testFilePath, provider, callback) {
      provider.get(testFilePath, (error, content) => {
        if (!error) {
          var runningTest = {}
          runningTest[testFilePath] = { content }
          remixTests.runTestSources(runningTest, testCallback, resultsCallback, (error, result) => {
            updateFinalResult(error, result)
            callback(error)
          }, (url, cb) => { this._deps.app.importFileCb(url, cb) })
        }
      })
    }

    function getTests () {
      var path = this._deps.fileManager.currentPath()
      var provider = this._deps.fileManager.fileProviderOf(path)
      var tests = []
      self._deps.fileManager.filesFromPath(path, (error, files) => {
        if (!error) {
          for (var file in files) {
            if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
          }
        }
      })
      return tests
    }

    self._events.filePanel.register('newTestFileCreated', file => {
      var testList = document.querySelector("[class^='testList']")
      var test = yo`<label><input onchange =${(e) => toggleCheckbox(e, file)} type="checkbox" checked="true">${file} </label>`
      testList.appendChild(test)
      self.data.allTests.push(file)
      self.data.selectedTests.push(file)
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

    var el = yo`
      <div class="${css.testTabView} "id="testView">
        <div class="${css.infoBox}">
          Test your smart contract by creating a foo_test.sol file.
          Open ballot_test.sol to see the example. For more details, see
          How to test smart contracts guide in our documentation.
        </div>
        <div class="${css.tests}">
          <div class=${css.testList}>${listTests()}</div>
          <div class=${css.buttons}>
            <div class=${css.runButton} onclick=${runTests}>Run Tests</div>
          </div>
          ${testsOutput}
          ${testsSummary}
        </div>
      </div>
    `
    return el
  }
}
