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
}
`
module.exports = settingsTab

function settingsTab () {
  return yo`
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
    </div>
  `
}
