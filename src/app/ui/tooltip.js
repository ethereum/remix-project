var yo = require('yo-yo')
var css = require('./styles/tooltip-styles')

/**
 * Open a tooltip
 * @param {string} tooltipText The text shown by the tooltip
 * @param {HTMLElement} [action] An HTMLElement to display for action
 */
module.exports = function addTooltip (tooltipText, action, opts) {
  opts = defaultOptions(opts)
  var tooltip = yo`
  <div class="${css.tooltip} bg-secondary">
    <span>${tooltipText}</span>
    ${action}
  </div>`
  return new Promise((resolve, reject) => {
    document.body.appendChild(tooltip)
    setTimeout(function () {
      document.body.removeChild(tooltip)
      resolve()
    }, opts.time)
  })
}

let defaultOptions = (opts) => {
  opts = opts || {}
  return {
    time: opts.time || 70000
  }
}
