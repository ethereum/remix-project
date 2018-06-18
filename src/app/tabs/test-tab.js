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
    var container = yo`<div class=${css.testsOutput} id="tests"></div>`
    self.data.allTests = getTests()
    self.data.selectedTests = self.data.allTests
    function append (container, txt) {
      var child = yo`<div>${txt}</div>`
      container.appendChild(child)
    }

    var testCallback = function (result) {
      if (result.type === 'contract') {
        append(container, '\n  ' + result.value)
      } else if (result.type === 'testPass') {
        append(container, '\t✓ ' + result.value)
      } else if (result.type === 'testFailure') {
        append(container, '\t✘ ' + result.value)
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
      if (result.totalPassing > 0) {
        append(container, ('  ' + result.totalPassing + ' passing ') + ('(' + result.totalTime + 's)'))
      }
      if (result.totalFailing > 0) {
        append(container, ('  ' + result.totalFailing + ' failing'))
      }

      result.errors.forEach((error, index) => {
        append(container, '  ' + (index + 1) + ') ' + error.context + ' ' + error.value)
        append(container, '')
        append(container, ('\t error: ' + error.message))
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
      var testList = document.querySelector(`[class^='testList']`)
      var test = yo`<label><input onchange =${(e) => toggleCheckbox(e, file)} type="checkbox">${file} </label>`
      testList.appendChild(test)
      self.data.allTests.push(file)
    })

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
      container.innerHTML = ''
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
          ${container}
        </div>
      </div>
    `
    return el
  }
}
