var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')

var css = csjs`
  .pluginTabView {
    height: 100%;
    width: 100%;
  }
  
  .iframe {
    height: 100%;
    width: 100%;
    border: 0;
  }
`

module.exports = plugintab

function plugintab (container, appAPI, events, opts, url) {
  var el = yo`
    <div class="${css.pluginTabView}" id="pluginView">
      <iframe class="${css.iframe}" src="${url}/index.html"></iframe>
    </div>`
  container.appendChild(el)
  return el
}
