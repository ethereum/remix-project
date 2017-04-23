var yo = require('yo-yo')
var csjs = require('csjs-inject')

module.exports = loadingSpinner

var css = csjs`
  .loader {
    display: inline-block;
    margin-left: .3em;
    border: 2px solid #C6CFD9; /* Light grey */
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
function loadingSpinner (cb) {
  var el = yo`<div class=${css.loader}></div>`
  if (cb) {
    cb(function finish () {
      var p = el.parentElement
      if (p) p.removeChild(el)
    })
  }
  return el
}
