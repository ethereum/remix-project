const EventEmitter = require('events')

class GetInstalledPlugins extends EventEmitter {
  command (cb) {
    const browser = this.api

    browser.waitForElementPresent('[plugin]:not([plugin=""]')
    .perform((done) => {
      browser.execute(() => {
        const pluginNames = []
        const plugins = document.querySelectorAll('[plugin]:not([plugin=""]')

        plugins.forEach(plugin => {
          pluginNames.push(plugin.getAttribute('plugin'))
        })
        return pluginNames
      }, [], (result) => {
        done()
        cb(result.value)
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = GetInstalledPlugins
