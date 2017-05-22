var yo = require('yo-yo')
// -------------- styling ----------------------
var csjs = require('csjs-inject')

module.exports = loadingSpinner

var css = csjs`
  .loader {
    display: inline-block;
    margin-left: .3em;
    border: 2px solid orange;
    border-top: 2px solid #F4F6FF; /* Light blue */
    border-radius: 50%;
    width: 8px;
    height: 8px;
    animation: spin 2s linear infinite;
  }
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
`
function loadingSpinner () {
  var el = yo`<div class=${css.loader}></div>`
  return el
}
