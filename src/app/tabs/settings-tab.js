var yo = require('yo-yo')
var QueryParams = require('../../lib/query-params')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('../../style-guide')
var styles = styleGuide()

var css = csjs`
  .settingsTabView {
    padding: 2%;
    display: flex;
  }
  .info extends ${styles.infoTextBox} {
    margin-bottom: 2em;
    word-break: break-word;
  }
  .crow {
    margin-top: 1em;
    display: flex;
  }
  .select extends ${styles.dropdown} {
  }
}
`
module.exports = SettingsTab

function SettingsTab (container, appAPI, appEvents, opts) {
  if (typeof container === 'string') container = document.querySelector(container)
  if (!container) throw new Error('no container given')

  var queryParams = new QueryParams()

  var el = yo`
    <div class="${css.settingsTabView} "id="settingsView">
      <div class="${css.info}">
        <div>Your current Solidity version is</div>
        <div id="version"></div>
      </div>
      <div class="${css.crow}">
        <select class="${css.select}" id="versionSelector"></select>
      </div>
      <div class="${css.crow}">
        <div><input class="${css.col1}" id="editorWrap" type="checkbox"></div>
        <span class="${css.checkboxText}">Text Wrap</span>
      </div>
      <div class="${css.crow}">
        <div><input class="${css.col1}" id="optimize" type="checkbox"></div>
        <span class="${css.checkboxText}">Enable Optimization</span>
      </div>
    </div>
  `

  var optimize = el.querySelector('#optimize')
  if ((queryParams.get().optimize === 'true')) {
    optimize.setAttribute('checked', true)
    appAPI.setOptimize(true, false)
  } else {
    appAPI.setOptimize(false, false)
  }

  optimize.addEventListener('change', function () {
    var optimize = this.checked
    queryParams.update({ optimize: optimize })
    appAPI.setOptimize(optimize, true)
  })

  container.appendChild(el)
}
