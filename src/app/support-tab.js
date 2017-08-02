var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .supportTabView {
    height: 100vh;
    padding: 2%;
    margin-top: 1em;
    padding-bottom: 3em;
  }
  .chatIframe {
    width: 102%;
    height: 120%;
    border: 0;
    overflow: hidden;
  }
`
// transform:
// translate(-8%, -12%) scale(0.8);

module.exports = supportTab

function supportTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.supportTabView} "id="supportView">
      <iframe class="${css.chatIframe}" src='https://gitter.im/ethereum/remix/~embed'>
    </div>
  `
  container.appendChild(el)
}
