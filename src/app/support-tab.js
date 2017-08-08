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
  .chat extends ${styles.displayBox} {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
  .chatTitle {
    cursor: pointer;
    height: 40px;
    width: 92%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background-color: white;
    border: 2px dotted ${styles.colors.lightGrey};
  }
  .chatTitle:hover {
    background-color: ${styles.colors.lightYellow};
  }
  .icon {
    height: 70%;
    margin-right: 2%;
  }
  .chatTitleText {
    font-size: 13px;
    font-weight: bold;
  }
  .chatTitleText {
    opacity: 0.8;
  }
  .chatIframe {
    width: 102%;
    height: 80%;
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
    <a href='https://remix.readthedocs.io/en/latest/'> the documentation page on Remix</a> or
    <a href='https://solidity.readthedocs.io/en/latest/'> Solidity</a>.
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
      <div class="${css.chat}">
        <div class="${css.chatTitle}" onclick=${openLink} title='Click to open chat in Gitter'>
          <img class="${css.icon}" title="Solidity" src="assets/img/remix_logo_512x512.svg">
          <div class="${css.chatTitleText}">ethereum/remix community chat</div>
        </div>
        <iframe class="${css.chatIframe}" src='https://gitter.im/ethereum/remix/~embed'>
      </div>
    </div>
  `
  container.appendChild(el)
}

function openLink () {
  window.open('https://gitter.im/ethereum/remix')
}
