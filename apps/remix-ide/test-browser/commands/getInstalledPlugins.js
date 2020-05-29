const EventEmitter = require('events')

class GetInstalledPlugins extends EventEmitter {
  command (cb) {
    const browser = this.api
    const plugins = []

    browser.click('*[data-id="remixIdeIconPanel"]')
    .waitForElementPresent('[plugin]:not([plugin=""])')
    .elements('css selector', '[plugin]:not([plugin=""])', (res) => {
      res.value.forEach(function (jsonWebElement) {
        const jsonWebElementId = jsonWebElement.ELEMENT || jsonWebElement[Object.keys(jsonWebElement)[0]]

        browser.elementIdAttribute(jsonWebElementId, 'plugin', (jsonElement) => {
          const attribute = jsonElement.value

          plugins.push(attribute)
        })
      })
    })
    .perform((done) => {
      done()
      cb(plugins)
      this.emit('complete')
    })
    return this
  }
}

module.exports = GetInstalledPlugins