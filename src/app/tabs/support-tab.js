const yo = require('yo-yo')
var css = require('./styles/support-tab-styles')

var globalRegistry = require('../../global/registry')

var EventManager = require('../../lib/events')

class SupportTab {

  constructor (localRegistry) {
    this.event = new EventManager()

    this.el = null
    this.gitterIframe = ''

    this.data = { gitterIsLoaded: false }
    this._components = {}
    this._components.registry = localRegistry || globalRegistry

    this._deps = {
      app: this._components.registry.get('app').api
    }

    this._deps.app.event.register('tabChanged', (tabName) => {
      if (tabName !== 'Support' || this.data.gitterIsLoaded) return
      const iframe = yo`<iframe class="${css.chatIframe}" src='https://gitter.im/ethereum/remix/~embed'>`
      this.gitterIframe.parentNode.replaceChild(iframe, this.gitterIframe)
      this.gitterIframe = iframe
      this.el.style.display = 'block'
      this.data.gitterIsLoaded = true
    })
  }

  render () {
    if (this.el) return this.el

    this.gitterIframe = yo`<div></div>`

    const remixd = yo`
      <div class="${css.info}">
        <div class=${css.title}>Accessing local files</div>
        <div class="${css.crow}">
          Remixd is a tool which allow Remix IDE to access files located in your local computer.
          it can also be used to setup a development environment.
        </div>
        <div class="${css.crow}">More infos:</div>
        <div class="${css.crow}"><a target="_blank" href="https://github.com/ethereum/remixd"> https://github.com/ethereum/remixd</a></div>
        <div class="${css.crow}"><a target="_blank" href="https://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem">http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html</a></div>
        <div class="${css.crow}">Installation: <pre class=${css.remixdinstallation}>npm install remixd -g</pre></div>
      </div>`

    const localremixd = yo`
      <div class="${css.info}">
        <div class=${css.title}>Running Remix locally</div>
        <div class="${css.crow}">
          as a NPM module:
        </div>
        <a target="_blank" href="https://www.npmjs.com/package/remix-ide">https://www.npmjs.com/package/remix-ide</a>
        <pre class=${css.remixdinstallation}>npm install remix-ide -g</pre>
        <div class="${css.crow}">
          as an electron app:
        </div>
        <a target="_blank" href="https://github.com/horizon-games/remix-app">https://github.com/horizon-games/remix-app</a>
      </div>`

    this.el = yo`
      <div class="${css.supportTabView}" id="supportView">
        <div class="${css.infoBox}">
          Have a question, found a bug or want to propose a feature? Have a look at the
          <a target="_blank" href='https://github.com/ethereum/remix-ide/issues'> issues</a> or check out
          <a target="_blank" href='https://remix.readthedocs.io/en/latest/'> the documentation page on Remix</a> or
          <a target="_blank" href='https://solidity.readthedocs.io/en/latest/'> Solidity</a>.
        </div>
        <div class="${css.chat}">
          <div class="${css.chatTitle}" onclick=${() => { window.open('https://gitter.im/ethereum/remix') }} title='Click to open chat in Gitter'>
            <div class="${css.chatTitleText}">ethereum/remix community chat</div>
          </div>
          ${this.gitterIframe}
        </div>
        ${remixd}
        ${localremixd}
      </div>`

    return this.el
  }

}

module.exports = SupportTab
