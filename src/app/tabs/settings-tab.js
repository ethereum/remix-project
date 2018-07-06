/* global Worker */
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var minixhr = require('minixhr')
var remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')
var QueryParams = require('../../lib/query-params')
var helper = require('../../lib/helper')
var modal = require('../ui/modal-dialog-custom')
var tooltip = require('../ui/tooltip')
var copyToClipboard = require('../ui/copy-to-clipboard')
var styleGuide = require('../ui/styles-guide/theme-chooser')

var styles = styleGuide.chooser()
var Storage = remixLib.Storage
var EventManager = remixLib.EventManager

module.exports = class SettingsTab {
  constructor (localRegistry) {
    const self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    // dependencies
    self._deps = {
      compiler: self._components.registry.get('compiler').api,
      config: self._components.registry.get('config').api,
      editorPanel: self._components.registry.get('editorpanel').api,
      editor: self._components.registry.get('editor').api,
      righthandpanel: self._components.registry.get('righthandpanel').api
    }
    self._view = { /* eslint-disable */
      el: null,
      optionVM: null, personal: null, optimize: null, warnPersonalMode: null,
      pluginInput: null, versionSelector: null, version: null,
      theme: { dark: null, light: null },
      config: {
        solidity: null, general: null, themes: null,
        plugin: null, remixd: null, localremixd: null
      }
    } /* eslint-enable */
    self.data = {
      allversions: null,
      selectedVersion: null,
      baseurl: 'https://solc-bin.ethereum.org/bin'
    }
    self.event = new EventManager()
    self._components.queryParams = new QueryParams()
    self._components.themeStorage = new Storage('style:')
    self.data.optimize = !!self._components.queryParams.get().optimize
    self._components.queryParams.update({ optimize: self.data.optimize })
    self._deps.compiler.setOptimize(self.data.optimize)
    self.data.currentTheme = self._components.themeStorage.get('theme') || 'light'

    self._deps.compiler.event.register('compilerLoaded', (version) => self.setVersionText(version))
    self.fetchAllVersion((allversions, selectedVersion) => {
      self.data.allversions = allversions
      self.data.selectedVersion = selectedVersion
      if (self._view.versionSelector) self._updateVersionSelector()
    })
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el

    // Gist settings
    var gistAccessToken = yo`<input id="gistaccesstoken" type="password">`
    var token = self._deps.config.get('settings/gist-access-token')
    if (token) gistAccessToken.value = token
    var gistAddToken = yo`<input class="${css.savegisttoken}" id="savegisttoken" onclick=${() => { self._deps.config.set('settings/gist-access-token', gistAccessToken.value); tooltip('Access token saved') }} value="Save" type="button">`
    var gistRemoveToken = yo`<input id="removegisttoken" onclick=${() => { gistAccessToken.value = ''; self._deps.config.set('settings/gist-access-token', ''); tooltip('Access token removed') }} value="Remove" type="button">`
    self._view.gistToken = yo`<div class="${css.checkboxText}">${gistAccessToken}${copyToClipboard(() => self._deps.config.get('settings/gist-access-token'))}${gistAddToken}${gistRemoveToken}</div>`
    //
    self._view.optionVM = yo`<input onchange=${onchangeOption} id="alwaysUseVM" type="checkbox">`
    if (self._deps.config.get('settings/always-use-vm')) self._view.optionVM.setAttribute('checked', '')
    self._view.personal = yo`<input onchange=${onchangePersonal} id="personal" type="checkbox">`
    if (self._deps.config.get('settings/personal-mode')) self._view.personal.setAttribute('checked', '')
    self._view.optimize = yo`<input onchange=${onchangeOptimize} id="optimize" type="checkbox">`
    if (self.data.optimize) self._view.optimize.setAttribute('checked', '')
    var warnText = `Transaction sent over Web3 will use the web3.personal API - be sure the endpoint is opened before enabling it.
    This mode allows to provide the passphrase in the Remix interface without having to unlock the account.
    Although this is very convenient, you should completely trust the backend you are connected to (Geth, Parity, ...).
    It is not recommended (and also most likely not relevant) to use this mode with an injected provider (Mist, Metamask, ...) or with JavaScript VM.
    Remix never persist any passphrase.`.split('\n').map(s => s.trim()).join(' ')
    self._view.warnPersonalMode = yo`<i title=${warnText} class="${css.icon} fa fa-exclamation-triangle" aria-hidden="true"></i>`
    self._view.pluginInput = yo`<textarea rows="4" cols="70" id="plugininput" type="text" class="${css.pluginTextArea}" ></textarea>`
    self._view.versionSelector = yo`
      <select onchange=${onchangeLoadVersion} class="${css.select}" id="versionSelector" disabled>
        <option disabled selected>Select new compiler version</option>
      </select>`
    if (self.data.allversions && self.data.selectedVersion) self._updateVersionSelector()
    self._view.version = yo`<span id="version"></span>`
    self._view.theme.light = yo`<input onchange=${onswitch2lightTheme} class="${css.col1}" name="theme" id="themeLight" type="radio">`
    self._view.theme.dark = yo`<input onchange=${onswitch2darkTheme} class="${css.col1}" name="theme" id="themeDark" type="radio">`
    self._view.theme[self.data.currentTheme].setAttribute('checked', 'checked')
    self._view.config.solidity = yo`
      <div class="${css.info}">
        <div class=${css.title}>Solidity version</div>
        <span>Current version:</span> ${self._view.version}
        <div class="${css.crow}">
          ${self._view.versionSelector}
        </div>
      </div>`
    self._view.config.general = yo`
      <div class="${css.info}">
          <div class=${css.title}>General settings</div>
          <div class="${css.crow}">
            <div>${self._view.optionVM}</div>
            <span class="${css.checkboxText}">Always use Ethereum VM at Load</span>
          </div>
          <div class="${css.crow}">
            <div><input id="editorWrap" type="checkbox" onchange=${function () { self._deps.editor.resize(this.checked) }}></div>
            <span class="${css.checkboxText}">Text Wrap</span>
          </div>
          <div class="${css.crow}">
            <div>${self._view.optimize}</div>
            <span class="${css.checkboxText}">Enable Optimization</span>
          </div>
          <div class="${css.crow}">
            <div>${self._view.personal}></div>
            <span class="${css.checkboxText}">Enable Personal Mode ${self._view.warnPersonalMode}></span>
          </div>
      </div>
      `
    self._view.gistToken = yo`
      <div class="${css.info}">
        <div class=${css.title}>Gist Access Token</div>
        <div class="${css.crowNoFlex}">Manage the access token used to publish to Gist.</div>
        <div class="${css.crowNoFlex}">Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only 'create gist' permission.</div>
        <div class="${css.crowNoFlex}"><a target="_blank" href="https://github.com/settings/tokens">https://github.com/settings/tokens</a></div>
        <div class="${css.crowNoFlex}">${self._view.gistToken}</div>
      </div>`
    self._view.config.themes = yo`
      <div class="${css.info}">
        <div class=${css.title}>Themes</div>
        <div class=${css.attention}>
          <i title="Select the theme" class="${css.icon} fa fa-exclamation-triangle" aria-hidden="true"></i>
          <span>Selecting a theme will trigger a page reload</span>
        </div>
        <div class="${css.crow}">
          ${self._view.theme.light}
          <label for="themeLight">Light Theme</label>
        </div>
        <div class="${css.crow}">
          ${self._view.theme.dark}
          <label for="themeDark">Dark Theme</label>
        </div>
      </div>`
    self._view.config.plugin = yo`
      <div class="${css.info}">
        <div class=${css.title}>Plugin</div>
        <div class="${css.crowNoFlex}">
          <div><input onclick=${() => { onLoadPlugin('oraclize') }} type="button" value="Oraclize" class="${css.pluginLoad}"></div>
          <div><input onclick=${() => { onLoadPlugin('etherscan-general') }} type="button" value="Etherscan-general" class="${css.pluginLoad}"></div>
          <div>
            ${self._view.pluginInput}
            <input onclick=${onloadPluginJson} type="button" value="Load" class="${css.pluginLoad}">
          </div>
        </div>
      </div>`
    self._view.config.remixd = yo`
      <div class="${css.info}">
        <div class=${css.title}>Remixd</div>
        <div class="${css.crow}">
          Remixd is a tool which allow Remix IDE to access files located in your local computer.
          it can also be used to setup a development environment.
        </div>
        <div class="${css.crow}">More infos:</div>
        <div class="${css.crow}"><a target="_blank" href="https://github.com/ethereum/remixd"> https://github.com/ethereum/remixd</a></div>
        <div class="${css.crow}"><a target="_blank" href="https://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem">http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html</a></div>
        <div class="${css.crow}">Installation: <pre class=${css.remixdinstallation}>npm install remixd -g</pre></div>
      </div>`
    self._view.config.localremixd = yo`
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
    self._view.el = yo`
      <div class="${css.settingsTabView} "id="settingsView">
        ${self._view.config.solidity}
        ${self._view.config.general}
        ${self._view.gistToken}
        ${self._view.config.themes}
        ${self._view.config.plugin}
        ${self._view.config.remixd}
        ${self._view.config.localremixd}
      </div>`
    function onchangeOption (event) {
      self._deps.config.set('settings/always-use-vm', !self._deps.config.get('settings/always-use-vm'))
    }
    function onLoadPlugin (name) {
      // @TODO: BAD! REFACTOR: no module should trigger events of another modules emitter
      self._deps.righthandpanel.event.trigger('plugin-name-loadRequest', [name])
    }
    function onloadPluginJson (event) {
      try {
        var json = JSON.parse(self._view.pluginInput.value)
      } catch (e) {
        return modal.alert('cannot parse the plugin definition to JSON')
      }
      // @TODO: BAD! REFACTOR: no module should trigger events of another modules emitter
      self._deps.righthandpanel.event.trigger('plugin-loadRequest', [json])
    }
    function onswitch2darkTheme (event) {
      styleGuide.switchTheme('dark')
      window.location.reload()
    }
    function onswitch2lightTheme (event) {
      styleGuide.switchTheme('light')
      window.location.reload()
    }
    function onchangeOptimize (event) {
      self.data.optimize = !!self._view.optimize.checked
      self._components.queryParams.update({ optimize: self.data.optimize })
      self._deps.compiler.setOptimize(self.data.optimize)
      self._deps.app.runCompiler()
    }
    function onchangeLoadVersion (event) {
      self.data.selectedVersion = self._view.versionSelector.value
      self._updateVersionSelector()
    }
    function onchangePersonal (event) {
      self._deps.config.set('settings/personal-mode', !self._deps.config.get('settings/personal-mode'))
    }
    return self._view.el
  }
  setVersionText (text) {
    const self = this
    self.data.version = text
    if (self._view.version) self._view.version.innerText = text
  }
  _updateVersionSelector () {
    const self = this
    self._view.versionSelector.innerHTML = ''
    self._view.versionSelector.appendChild(yo`<option disabled selected>Select new compiler version</option>`)
    self.data.allversions.forEach(build => self._view.versionSelector.appendChild(yo`<option value=${build.path}>${build.longVersion}</option>`))
    self._view.versionSelector.removeAttribute('disabled')
    self._components.queryParams.update({ version: self.data.selectedVersion })
    var url
    if (self.data.selectedVersion === 'builtin') {
      var location = window.document.location
      location = location.protocol + '//' + location.host + '/' + location.pathname
      if (location.endsWith('index.html')) location = location.substring(0, location.length - 10)
      if (!location.endsWith('/')) location += '/'
      url = location + 'soljson.js'
    } else {
      if (self.data.selectedVersion.indexOf('soljson') !== 0 || helper.checkSpecialChars(self.data.selectedVersion)) {
        return console.log('loading ' + self.data.selectedVersion + ' not allowed')
      }
      url = `${self.data.baseurl}/${self.data.selectedVersion}`
    }
    var isFirefox = typeof InstallTrigger !== 'undefined'
    if (document.location.protocol !== 'file:' && Worker !== undefined && isFirefox) {
      // Workers cannot load js on "file:"-URLs and we get a
      // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
      // resort to non-worker version in that case.
      self._deps.compiler.loadVersion(true, url)
      self.setVersionText('(loading using worker)')
    } else {
      self._deps.compiler.loadVersion(false, url)
      self.setVersionText('(loading)')
    }
  }
  fetchAllVersion (callback) {
    var self = this
    minixhr(`${self.data.baseurl}/list.json`, function (json, event) {
      // @TODO: optimise and cache results to improve app loading times
      var allversions, selectedVersion
      if (event.type !== 'error') {
        try {
          const data = JSON.parse(json)
          allversions = data.builds.slice().reverse()
          selectedVersion = data.releases[data.latestRelease]
          if (self._components.queryParams.get().version) selectedVersion = self._components.queryParams.get().version
        } catch (e) {
          tooltip('Cannot load compiler version list. It might have been blocked by an advertisement blocker. Please try deactivating any of them from this page and reload.')
        }
      } else {
        allversions = [{ path: 'builtin', longVersion: 'latest local version' }]
        selectedVersion = 'builtin'
      }
      callback(allversions, selectedVersion)
    })
  }
}

const css = csjs`
  .settingsTabView {
    padding: 2%;
    display: flex;
  }
  .info {
    ${styles.rightPanel.settingsTab.box_SolidityVersionInfo}
    margin-bottom: 1em;
    word-break: break-word;
  }
  .title {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 1em;
  }
  .crow {
    display: flex;
    overflow: auto;
    clear: both;
    padding: .2em;
  }
  .checkboxText {
    font-weight: normal;
  }
  .crow label {
    cursor:pointer;
  }
  .crowNoFlex {
    overflow: auto;
    clear: both;
  }
  .attention {
    margin-bottom: 1em;
    padding: .5em;
    font-weight: bold;
  }
  .select {
    font-weight: bold;
    margin-top: 1em;
    ${styles.rightPanel.settingsTab.dropdown_SelectCompiler}
  }
  .heading {
    margin-bottom: 0;
  }
  .explaination {
    margin-top: 3px;
    margin-bottom: 3px;
  }
  input {
    margin-right: 5px;
    cursor: pointer;
  }
  input[type=radio] {
    margin-top: 2px;
  }
  .pluginTextArea {
    font-family: unset;
  }
  .pluginLoad {
    vertical-align: top;
  }
  i.warnIt {
    color: ${styles.appProperties.warningText_Color};
  }
  .icon {
    margin-right: .5em;
  }
  .remixdinstallation {
    padding: 3px;
    border-radius: 2px;
    margin-left: 5px;
  }
  .savegisttoken {
    margin-left: 5px;
  }
`
