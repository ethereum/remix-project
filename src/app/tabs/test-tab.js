var yo = require('yo-yo')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')

function testTabView (api) {
  let testCallback = function (result) {
    if (result.type === 'contract') {
      console.log('\n  ' + result.value)
    } else if (result.type === 'testPass') {
      console.log('\t✓ ' + result.value)
    } else if (result.type === 'testFailure') {
      console.log('\t✘ ' + result.value)
    }
  }

  let resultsCallback = function (_err, result, cb) {
    console.dir(result)
    console.dir('testName ' + result.context)
    console.dir(result.passingNum)
    console.dir(result.failureNum)
    console.dir(result.timePassed)
    cb()
  }

  let finalCallback = function (_err, result) {
    console.dir('finalCallback')

    if (result.totalPassing > 0) {
      console.log(('  ' + result.totalPassing + ' passing ') + ('(' + result.totalTime + 's)'))
    }
    if (result.totalFailing > 0) {
      console.log(('  ' + result.totalFailing + ' failing'))
    }

    result.errors.forEach((error, index) => {
      console.log('  ' + (index + 1) + ') ' + error.context + ' ' + error.value)
      console.log('')
      console.log(('\t error: ' + error.message))
    })
  }

  let runTests = function () {
    let contractSources = api.getAllSources()

    remixTests.runTestSources(contractSources, testCallback, resultsCallback, finalCallback)
  }

  return yo`
    <div class="${css.testTabView} "id="testView">
      <div>
        <div class="${css.infoBox}">
        </div>
      </div>
      <div class="${css.testList}">
        <p><button onclick=${runTests}>Run Tests</button></p>
      </div>
    </div>
  `
}

function testTab (api = {}, events = {}, opts = {}) {
  let el = testTabView(api)
  let gitterIsLoaded = false

  events.app.register('tabChanged', (tabName) => {
    if (tabName !== 'test' || gitterIsLoaded) {
      return
    }

    yo.update(el, testTabView(api))
    el.style.display = 'block'
    gitterIsLoaded = true
  })

  return { render () { return el } }
}

module.exports = testTab
