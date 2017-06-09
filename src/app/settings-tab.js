var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .settingsTabView {
    padding: 2%;
    display: flex;
  }
  .info extends ${styles.infoTextBox} {
    margin-bottom: 2em;
  }
  .crow {
    margin-top: 1em;
    display: flex;
  }
  .select extends ${styles.dropdown} {
    float: left;
    max-width: 90%;
  }
  .button extends ${styles.button} {
    background-color: #C6CFF7;
    width: 100%;
    align-self: center;
    text-align: -webkit-center;
  }
  .col1 extends ${styles.titleL} {
    float: left;
    align-self: center;
  }
  .checkboxText {
    margin-left: 3px;
  }
  .compilationWarning extends ${styles.warningTextBox} {
    margin-top: 1em;
    margin-left: 0.5em;
  }
}
`
module.exports = SettingsTab

function SettingsTab (container, appAPI, appEvents, opts) {
  if (typeof container === 'string') container = document.querySelector(container)
  if (!container) throw new Error('no container given')

  var warnCompilationSlow = yo`<div id="warnCompilationSlow"></div>`

  appEvents.compiler.register('compilationDuration', function tabHighlighting (speed) {
    var settingsView = document.querySelector('#header #menu .settingsView')
    if (speed > 1000) {
      warnCompilationSlow.className = css.compilationWarning
      warnCompilationSlow.innerHTML = `Last compilation took ${speed}ms. We suggest to turn off autocompilation.`
      warnCompilationSlow.style.visibility = 'visible'
      settingsView.style.color = '#FF8B8B'
    }
  })

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
      <div class="${css.crow}">
        <div><input class="${css.col1}" id="autoCompile" type="checkbox" checked></div>
        <span class="${css.checkboxText}">Auto Compile</span>
      </div>
      </div>
      <div class="${css.crow}">
        <div class="${css.button} "id="compile" title="Compile source code">Compile</div>
      </div>
      ${warnCompilationSlow}
    </div>
  `
  container.appendChild(el)
}
