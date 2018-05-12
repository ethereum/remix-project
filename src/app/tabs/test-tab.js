var yo = require('yo-yo')

var css = require('./styles/test-tab-styles')

var remixTests = require('remix-tests')

function runTests () {
  // remixTests.runTest(testName, testObject, testCallback, resultsCallback)
  let contractSources = api.compilerContracts.getSources()
  remixTests.runTestSources(contractSources)
}

function testTabView () {
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
  window.api = api
  console.dir('------')
  console.dir(api)
  let el = testTabView('')
  let gitterIsLoaded = false

  // api.compilerContracts.getSources()

  events.app.register('tabChanged', (tabName) => {
    if (tabName !== 'test' || gitterIsLoaded) {
      return
    }

    yo.update(el, testTabView())
    el.style.display = 'block'
    gitterIsLoaded = true
  })

  return { render () { return el } }
}

module.exports = testTab
