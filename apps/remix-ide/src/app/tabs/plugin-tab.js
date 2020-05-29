var yo = require('yo-yo')
var css = require('./styles/plugin-tab-styles')

class PluginTab {

  constructor (json) {
    this.el = null
    this.data = { json }
  }

  render () {
    if (this.el) return this.el

    this.el = yo`
      <div class="${css.pluginTabView}" id="pluginView">
        <iframe class="${css.iframe}" src="${this.data.json.url}/index.html"></iframe>
      </div>`

    return this.el
  }

}

module.exports = PluginTab
