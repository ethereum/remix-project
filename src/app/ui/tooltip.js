var yo = require('yo-yo')
// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .tooltip {
    z-index: 1001;
    display: inline-block;
    position: fixed;
    background-color: ${styles.remix.tooltip_CopyToClipboard_BackgroundColor};
    color: ${styles.remix.tooltip_CopyToClipboard_Color};
    min-height: 50px;
    min-width: 290px;
    padding: 16px 24px 12px;
    border-radius: 3px;
    bottom: -300;
    left: 40%;
    font-size: 12px;
    -webkit-animation-name: animatebottom;
    -webkit-animation-duration: 6s;
    animation-name: animatebottom;
    animation-duration: 6s
  }
  @-webkit-keyframes animatebottom {
    0% {bottom: -300px; opacity: 0}
    20% {bottom: 0; opacity: 0.8}
    50% {bottom: 0; opacity: 1}
    100% {bottom: -300px; opacity: 0}
  }
  @keyframes animatebottom {
    0% {bottom: -300px; opacity: 0}
    20% {bottom: 0; opacity: 0.8}
    50% {bottom: 0; opacity: 1}
    100% {bottom: -300px; opacity: 0} 1}
  }
`

module.exports = function addTooltip (event, tooltipText) {
  var tooltip = yo`<div class=${css.tooltip}>${tooltipText}</div>`
  document.body.appendChild(tooltip)
  setTimeout(function () {
    document.body.removeChild(tooltip)
  }, 7000)
}
