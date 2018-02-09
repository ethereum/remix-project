var yo = require('yo-yo')
var css = require('./styles/tooltip-styles')

module.exports = function addTooltip (tooltipText) {
  var tooltip = yo`<div class=${css.tooltip}>${tooltipText}</div>`
  document.body.appendChild(tooltip)
  setTimeout(function () {
    document.body.removeChild(tooltip)
  }, 7000)
}
