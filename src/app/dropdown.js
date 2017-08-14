var yo = require('yo-yo')
var csjs = require('csjs-inject')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

module.exports = dropdown

// options = []
function dropdown (options = []) {
  var el = yo`
    <select>
      ${options.map(opt => yo`<option>${opt}</option>`)}
    </select>
  `
}
