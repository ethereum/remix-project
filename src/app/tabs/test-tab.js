var yo = require('yo-yo')
var css = require('./styles/test-tab-styles')
var remixTests = require('remix-tests')

function testTabView (api) {
  let runTests = function () {
    let contractSources = api.getAllSources()
    remixTests.runTestSources(contractSources)
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
