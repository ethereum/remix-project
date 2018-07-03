const yo = require('yo-yo')
const csjs = require('csjs-inject')
const remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')
const styles = require('../ui/styles-guide/theme-chooser').chooser()

const EventManager = remixLib.EventManager

module.exports = class SupportTab {
  constructor (localRegistry) {
    const self = this
    self.event = new EventManager()
    self._view = { el: null, gitterIframe: '' }
    self.data = { gitterIsLoaded: false }
    self._components = {}
    self._components.registry = localRegistry || globalRegistry

    self._deps = {
      app: self._components.registry.get('app').api
    }

    self._deps.app.event.register('tabChanged', (tabName) => {
      if (tabName !== 'Support' || self.data.gitterIsLoaded) return
      const iframe = yo`<iframe class="${css.chatIframe}" src='https://gitter.im/ethereum/remix/~embed'>`
      self._view.gitterIframe.parentNode.replaceChild(iframe, self._view.gitterIframe)
      self._view.gitterIframe = iframe
      self._view.el.style.display = 'block'
      self.data.gitterIsLoaded = true
    })
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el
    self._view.gitterIframe = yo`<div></div>`
    self._view.el = yo`
      <div class="${css.supportTabView}" id="supportView">
        <div class="${css.infoBox}">
          Have a question, found a bug or want to propose a feature? Have a look at the
          <a target="_blank" href='https://github.com/ethereum/browser-solidity/issues'> issues</a> or check out
          <a target="_blank" href='https://remix.readthedocs.io/en/latest/'> the documentation page on Remix</a> or
          <a target="_blank" href='https://solidity.readthedocs.io/en/latest/'> Solidity</a>.
        </div>
        <div class="${css.chat}">
          <div class="${css.chatTitle}" onclick=${openLink} title='Click to open chat in Gitter'>
            <div class="${css.chatTitleText}">ethereum/remix community chat</div>
          </div>
          ${self._view.gitterIframe}
        </div>
      </div>`
    return self._view.el
    function openLink () { window.open('https://gitter.im/ethereum/remix') }
  }
}

const css = csjs`
  .supportTabView {
    height: 100vh;
    padding: 2%;
    padding-bottom: 3em;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .chat {
    ${styles.rightPanel.supportTab.box_IframeContainer}
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 85%;
    padding: 0;
  }
  .chatTitle {
    height: 40px;
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
  }
  .chatTitle:hover {
    cursor: pointer;
  }
  .icon {
    height: 70%;
    margin-right: 2%;
  }
  .chatTitleText {
    font-size: 17px;
    font-weight: bold;
  }
  .chatTitleText {
    opacity: 0.8;
  }
  .chatIframe {
    width: 100%;
    height: 100%;
    transform: scale(0.9);
    padding: 0;
    border: none;
  }
  .infoBox {
    ${styles.rightPanel.supportTab.box_SupportInfo}
  }
`
