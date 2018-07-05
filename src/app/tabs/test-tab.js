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
    var self = this
    var container = yo`<div class="tests" id="tests"></div>`

    function append (container, txt) {
      let child = yo`<div>${txt}</div>`
      container.appendChild(child)
    }

    let testCallback = function (result) {
      if (result.type === 'contract') {
        append(container, '\n  ' + result.value)
      } else if (result.type === 'testPass') {
        append(container, '\t✓ ' + result.value)
      } else if (result.type === 'testFailure') {
        append(container, '\t✘ ' + result.value)
      }
    }

    let resultsCallback = function (_err, result, cb) {
      // total stats for the test
      // result.passingNum
      // result.failureNum
      // result.timePassed
      cb()
    }

    let updateFinalResult = function (_err, result) {
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

    let runTests = function () {
      container.innerHTML = ''
      var path = this._deps.fileManager.currentPath()
      var provider = this._deps.fileManager.fileProviderOf(path)
      var tests = []
      self._deps.fileManager.filesFromPath(path, (error, files) => {
        if (!error) {
          for (var file in files) {
            if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
          }
          async.eachOfSeries(tests, (value, key, callback) => { runTest(value, provider, callback) })
        }
      })
    }

    var el = yo`
      <div class="${css.testTabView} "id="testView">
        <div>
          <div class="${css.infoBox}">
          </div>
        </div>
        <div class="${css.testList}">
          <p><button onclick=${runTests}>Run Tests</button></p>
          ${container}
        </div>
      </div>
    `
    return el
  }
}
