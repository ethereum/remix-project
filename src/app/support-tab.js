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
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .chatIframe {
    width: 102%;
    height: 85%;
    border: 2px dotted ${styles.colors.lightGrey};
    overflow: hidden;
    transform:
      scale(0.9);
  }
  .infoBox extends ${styles.infoTextBox}{

  }
`

var infoText = yo`
  <div>
    Have a question, found a bug or want to propose a feature? Have a look at the
    <a href='https://github.com/ethereum/browser-solidity/issues'> issues</a> or check out
    <a href='https://remix.readthedocs.io/en/latest/'> the documentation page</a>.
    Or join our chat below.
  </div>
`

module.exports = supportTab

function supportTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.supportTabView} "id="supportView">
      <div>
        <div class="${css.infoBox}">
          ${infoText}
        </div>
      </div>
      <iframe class="${css.chatIframe}" src='https://gitter.im/ethereum/remix/~embed'>
    </div>
  `
  container.appendChild(el)
}
