var yo = require('yo-yo')
// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .tooltip {
    visibility: hidden;
    width: 100px;
    background-color: ${styles.remix.tooltip_CopyToClipboard_BackgroundColor};
    color: ${styles.remix.tooltip_CopyToClipboard_Color};
    font-weight: bold;
    font-size: 12px;
    text-transform: initial;
    text-align: center;
    border-radius: 3px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 160%;
    left: 100%;
    margin-left: -60px;
    opacity: 0;
    transition: opacity 1s;
  }
  .tooltip::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: ${styles.remix.tooltip_CopyToClipboard_BackgroundColor} transparent transparent transparent;
  }
`

module.exports = function addTooltip (event) {
  var icon = event.target
  icon.style.position = 'relative'
  var tooltip = yo`<div class=${css.tooltip}>Copied!</div>`
  icon.appendChild(tooltip)
  var copiedToolbox = event.target.children[0]
  copiedToolbox.style.visibility = 'visible'
  copiedToolbox.style.opacity = 1
  setTimeout(function () {
    copiedToolbox.style.visibility = 'hidden'
    copiedToolbox.style.opacity = 0
  }, 1000)
}
