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
    width: 50%;
    float: left;
  }
  .button extends ${styles.button} {
    background-color: #C6CFF7;
    width: 100%;
    align-self: center;
    text-align: -webkit-center;
  }
  .col1 extends ${styles.titleL} {
    width: 30%;
    float: left;
    align-self: center;
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
        Text Wrap
        <input class="${css.col1}" id="editorWrap" type="checkbox">
      </div>
      <div class="${css.crow}">
        Enable Optimization
        <input id="optimize" type="checkbox">
      </div>
      <div class="${css.crow}">
        Auto Compile
        <input id="autoCompile" type="checkbox" checked>
      </div>
      </div>
      <div class="${css.crow}">
        <div class="${css.button} "id="compile" title="Compile source code">Compile</div>
      </div>
    </div>
  `
}
