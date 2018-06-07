var yo = require('yo-yo')
var async = require('async')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')

function append (container, txt) {
  let child = yo`<div>${txt}</div>`
  container.appendChild(child)
}

const prototype = {
  constructor: function testTab (api = {}, events = {}, opts = {}) {
    const self = this
    self._opts = opts
    self._api = api
    self._events = events
    self._view = { el: null }
    self._components = {}
    self.data = {}

    self._view.el = prototype.render()

    events.app.register('tabChanged', tabName => {
      if (tabName !== 'test') return
      yo.update(self._view.el, prototype.render())
      self._view.el.style.display = 'block'
    })

    return { render () { return self._view.el } }
  },
  render: function render () {
    const self = this
    const api = self._api
    var container = yo`<div class="tests" id="tests"></div>`

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

    function runTest (testFilePath, callback) {
      var provider = api.fileProviderOf(testFilePath)
      provider.get(testFilePath, (error, content) => {
        if (!error) {
          var runningTest = {}
          runningTest[testFilePath] = { content }
          remixTests.runTestSources(runningTest, testCallback, resultsCallback, (error, result) => {
            updateFinalResult(error, result)
            callback(error)
          }, api.importFileCb)
        }
      })
    }

    let runTests = function () {
      container.innerHTML = ''
      var path = api.currentPath()
      var tests = []
      api.filesFromPath(path, (error, files) => {
        if (!error) {
          for (var file in files) {
            if (/.(_test.sol)$/.exec(file)) tests.push(path + file)
          }
          async.eachOfSeries(tests, (value, key, callback) => { runTest(value, callback) })
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
prototype.constructor.prototype = prototype
module.exports = prototype.constructor
