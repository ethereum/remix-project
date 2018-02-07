var yo = require('yo-yo')
var css = require('./styles/plugin-tab-styles')

function plugintab (container, url) {
  var el = yo`
    <div class="${css.pluginTabView}" id="pluginView">
      <iframe class="${css.iframe}" src="${url}/index.html"></iframe>
    </div>`
  container.appendChild(el)
  return el
}

module.exports = plugintab
