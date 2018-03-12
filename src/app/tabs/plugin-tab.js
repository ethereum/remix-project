var yo = require('yo-yo')
var css = require('./styles/plugin-tab-styles')

function plugintab (api = {}, events = {}, opts = {}) {
  var el = yo`
    <div class="${css.pluginTabView}" id="pluginView">
      <iframe class="${css.iframe}" src="${opts.url}/index.html"></iframe>
    </div>`
  return { render () { return el } }
}

module.exports = plugintab
