const yo = require('yo-yo')
var css = require('./styles/support-tab-styles')

import { ApiFactory } from 'remix-plugin'

class SupportTab extends ApiFactory {

  constructor (localRegistry) {
    super()
    this.el = null
    this.gitterIframe = ''
    this.gitterIsLoaded = false
  }

  __showing () {
    if (this.gitterIsLoaded) return

    const iframe = yo`<iframe class="${css.chatIframe}" src='https://gitter.im/ethereum/remix/~embed'></iframe>`
    this.gitterIframe.parentNode.replaceChild(iframe, this.gitterIframe)
    this.gitterIframe = iframe
    this.el.style.display = 'block'
    this.gitterIsLoaded = true
  }

  get profile () {
    return {
      name: 'support',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03MDQgMTkycTAtMjYtMTktNDV0LTQ1LTE5LTQ1IDE5LTE5IDQ1IDE5IDQ1IDQ1IDE5IDQ1LTE5IDE5LTQ1em04OTYtMzJ2MzIwcTAgMTYtMTIgMjUtOCA3LTIwIDctNCAwLTctMWwtNDQ4LTk2cS0xMS0yLTE4LTExdC03LTIwaC0yNTZ2MTAycTExMSAyMyAxODMuNSAxMTF0NzIuNSAyMDN2ODAwcTAgMjYtMTkgNDV0LTQ1IDE5aC01MTJxLTI2IDAtNDUtMTl0LTE5LTQ1di04MDBxMC0xMDYgNjIuNS0xOTAuNXQxNjEuNS0xMTQuNXYtMTExaC0zMnEtNTkgMC0xMTUgMjMuNXQtOTEuNSA1My02NiA2Ni41LTQwLjUgNTMuNS0xNCAyNC41cS0xNyAzNS01NyAzNS0xNiAwLTI5LTctMjMtMTItMzEuNS0zN3QzLjUtNDlxNS0xMCAxNC41LTI2dDM3LjUtNTMuNSA2MC41LTcwIDg1LTY3IDEwOC41LTUyLjVxLTI1LTQyLTI1LTg2IDAtNjYgNDctMTEzdDExMy00NyAxMTMgNDcgNDcgMTEzcTAgMzMtMTQgNjRoMzAycTAtMTEgNy0yMHQxOC0xMWw0NDgtOTZxMy0xIDctMSAxMiAwIDIwIDcgMTIgOSAxMiAyNXoiLz48L3N2Zz4=',
      description: 'help center'
    }
  }

  render () {
    if (this.el) return this.el

    this.gitterIframe = yo`<div></div>`

  generateRemixdUI () {
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
    return remixd
  }

  generateLocalRemixdUI () {
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
    return localremixd
  }

  render () {
    if (this.el) return this.el

    this.gitterIframe = yo`<div></div>`

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
        ${this.generateRemixdUI()}
        ${this.generateLocalRemixdUI()}
      </div>`

    return this.el
  }

}

module.exports = SupportTab
