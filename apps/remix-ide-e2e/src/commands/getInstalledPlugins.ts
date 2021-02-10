import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetInstalledPlugins extends EventEmitter {
  command (this: NightwatchBrowser, cb: (plugins: string[]) => void): NightwatchBrowser {
    const browser = this.api

    browser.waitForElementPresent('[plugin]:not([plugin=""]')
      .perform((done) => {
        browser.execute(function () {
          const pluginNames = []
          const plugins = document.querySelectorAll('[plugin]:not([plugin=""]')

          plugins.forEach(plugin => {
            pluginNames.push(plugin.getAttribute('plugin'))
          })
          return pluginNames
        }, [], (result) => {
          done()
          Array.isArray(result.value) && cb(result.value)
          this.emit('complete')
        })
      })
    return this
  }
}

module.exports = GetInstalledPlugins
