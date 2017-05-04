var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .filesTabView {
    padding: 2%;
  }
  .crow {
    margin-top: 1em;
    display: flex;
  }
  .infoBox extends ${styles.infoTextBox} {
    margin-top: 2em;
  }
`

module.exports = filesTab

function filesTab () {
  return yo`
    <div class="${css.filesTabView}" id="publishView">
      <div class="${css.crow}">
        <button id="gist" title="Publish all files as public gist on github.com">
          <i class="fa fa-github"></i>
          Publish Gist
        </button>
        Publish all open files to an anonymous github gist.<br>
      </div>
      <div class="${css.crow}">
        <button id="copyOver" title="Copy all files to another instance of browser-solidity.">
          Copy files
        </button>
        Copy all files to another instance of Browser-solidity.
      </div>
      <div class="${css.infoBox}">You can also load a gist by adding the following
        <span class="pre">#gist=GIST_ID</span>
        to your url, where GIST_ID is the id of the gist to load.
      </div>
    </div>
  `
}
