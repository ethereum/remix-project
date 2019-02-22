var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')
var tooltip = require('../ui/tooltip')
var copyToClipboard = require('../ui/copy-to-clipboard')
var styleGuide = require('../ui/styles-guide/theme-chooser')
// var styles = styleGuide.chooser()
var Storage = remixLib.Storage
var EventManager = require('../../lib/events')

module.exports = class SettingsTab {
  constructor (localRegistry) {
    const self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    // dependencies
    self._deps = {
      config: self._components.registry.get('config').api,
      editorPanel: self._components.registry.get('editorpanel').api,
      editor: self._components.registry.get('editor').api
    }
    self._view = { /* eslint-disable */
      el: null,
      optionVM: null, personal: null, warnPersonalMode: null, generateContractMetadata: null,
      pluginInput: null, versionSelector: null, version: null,
      theme: { dark: null, light: null, clean: null },
      plugins: {},
      config: {
        general: null, themes: null,
        plugin: null
      }
    } /* eslint-enable */
    self.data = {}
    self.event = new EventManager()
    self._components.themeStorage = new Storage('style:')
    self.data.currentTheme = self._components.themeStorage.get('theme') || 'light'
  }
  profile () {
    return {
      name: 'settings',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMTUyIDg5NnEwLTEwNi03NS0xODF0LTE4MS03NS0xODEgNzUtNzUgMTgxIDc1IDE4MSAxODEgNzUgMTgxLTc1IDc1LTE4MXptNTEyLTEwOXYyMjJxMCAxMi04IDIzdC0yMCAxM2wtMTg1IDI4cS0xOSA1NC0zOSA5MSAzNSA1MCAxMDcgMTM4IDEwIDEyIDEwIDI1dC05IDIzcS0yNyAzNy05OSAxMDh0LTk0IDcxcS0xMiAwLTI2LTlsLTEzOC0xMDhxLTQ0IDIzLTkxIDM4LTE2IDEzNi0yOSAxODYtNyAyOC0zNiAyOGgtMjIycS0xNCAwLTI0LjUtOC41dC0xMS41LTIxLjVsLTI4LTE4NHEtNDktMTYtOTAtMzdsLTE0MSAxMDdxLTEwIDktMjUgOS0xNCAwLTI1LTExLTEyNi0xMTQtMTY1LTE2OC03LTEwLTctMjMgMC0xMiA4LTIzIDE1LTIxIDUxLTY2LjV0NTQtNzAuNXEtMjctNTAtNDEtOTlsLTE4My0yN3EtMTMtMi0yMS0xMi41dC04LTIzLjV2LTIyMnEwLTEyIDgtMjN0MTktMTNsMTg2LTI4cTE0LTQ2IDM5LTkyLTQwLTU3LTEwNy0xMzgtMTAtMTItMTAtMjQgMC0xMCA5LTIzIDI2LTM2IDk4LjUtMTA3LjV0OTQuNS03MS41cTEzIDAgMjYgMTBsMTM4IDEwN3E0NC0yMyA5MS0zOCAxNi0xMzYgMjktMTg2IDctMjggMzYtMjhoMjIycTE0IDAgMjQuNSA4LjV0MTEuNSAyMS41bDI4IDE4NHE0OSAxNiA5MCAzN2wxNDItMTA3cTktOSAyNC05IDEzIDAgMjUgMTAgMTI5IDExOSAxNjUgMTcwIDcgOCA3IDIyIDAgMTItOCAyMy0xNSAyMS01MSA2Ni41dC01NCA3MC41cTI2IDUwIDQxIDk4bDE4MyAyOHExMyAyIDIxIDEyLjV0OCAyMy41eiIvPjwvc3ZnPg==',
      description: ' - ',
      kind: 'settings'
    }
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el

    // Gist settings
    var gistAccessToken = yo`<input id="gistaccesstoken" type="password" class="form-control mb-2 ${css.inline}" placeholder="Token">`
    var token = self._deps.config.get('settings/gist-access-token')
    if (token) gistAccessToken.value = token
    var gistAddToken = yo`<input class="${css.savegisttoken} btn btn-sm btn-primary" id="savegisttoken" onclick=${() => { self._deps.config.set('settings/gist-access-token', gistAccessToken.value); tooltip('Access token saved') }} value="Save" type="button">`
    var gistRemoveToken = yo`<input class="btn btn-sm btn-primary" id="removegisttoken" onclick=${() => { gistAccessToken.value = ''; self._deps.config.set('settings/gist-access-token', ''); tooltip('Access token removed') }} value="Remove" type="button">`
    self._view.gistToken = yo`<div class="${css.checkboxText}">${gistAccessToken}${copyToClipboard(() => self._deps.config.get('settings/gist-access-token'))}${gistAddToken}${gistRemoveToken}</div>`
    //
    self._view.optionVM = yo`<input onchange=${onchangeOption} class="align-middle form-check-input" id="alwaysUseVM" type="checkbox">`
    if (self._deps.config.get('settings/always-use-vm')) self._view.optionVM.setAttribute('checked', '')
    self._view.personal = yo`<input onchange=${onchangePersonal} id="personal" type="checkbox" class="align-middle form-check-input">`
    if (self._deps.config.get('settings/personal-mode')) self._view.personal.setAttribute('checked', '')
    var warnText = `Transaction sent over Web3 will use the web3.personal API - be sure the endpoint is opened before enabling it.
    This mode allows to provide the passphrase in the Remix interface without having to unlock the account.
    Although this is very convenient, you should completely trust the backend you are connected to (Geth, Parity, ...).
    It is not recommended (and also most likely not relevant) to use this mode with an injected provider (Mist, Metamask, ...) or with JavaScript VM.
    Remix never persist any passphrase.`.split('\n').map(s => s.trim()).join(' ')
    self._view.warnPersonalMode = yo`<i title=${warnText} class="${css.icon} fa fa-exclamation-triangle text-warning" aria-hidden="true"></i>`
    self._view.generateContractMetadata = yo`<input onchange=${onchangeGenerateContractMetadata} id="generatecontractmetadata" type="checkbox" class="form-check-input">`

    if (self._deps.config.get('settings/generate-contract-metadata')) self._view.generateContractMetadata.setAttribute('checked', '')

    self._view.pluginInput = yo`<textarea rows="4" cols="70" id="plugininput" type="text" class="${css.pluginTextArea}" ></textarea>`

    self._view.theme.light = yo`<input onchange=${onswitch2lightTheme} class="align-middle form-check-input" name="theme" id="themeLight" type="radio">`
    self._view.theme.dark = yo`<input onchange=${onswitch2darkTheme} class="align-middle form-check-input" name="theme" id="themeDark" type="radio">`
    self._view.theme.clean = yo`<input onchange=${onswitch2cleanTheme} class="align-middle form-check-input" name="theme" id="themeClean" type="radio">`
    self._view.theme[self.data.currentTheme].setAttribute('checked', 'checked')

    self._view.config.general = yo`
      <div class="${css.info} card">
        <div class="card-body">
          <h6 class="${css.title} card-title">General settings</h6>
          <div class="form-check ${css.frow}">
            <div>${self._view.generateContractMetadata}</div>
            <label class="form-check-label align-middle" for="generatecontractmetadata">Generate contract metadata. Generate a JSON file in the contract folder. Allows to specify library addresses the contract depends on. If nothing is specified, Remix deploys libraries automatically.</label>
          </div>
          <div class="form-check ${css.frow}">
            <div>${self._view.optionVM}</div>
            <label class="form-check-label align-middle" for="alwaysUseVM">Always use Ethereum VM at Load</label>
          </div>
          <div class="form-check ${css.frow}">
            <div><input id="editorWrap" class="form-check-input align-middle" type="checkbox" onchange=${function () { self._deps.editor.resize(this.checked) }}></div>
            <label class="form-check-label align-middle" for="editorWrap">Text Wrap</label>
          </div>
          <div class="form-check ${css.frow}">
            <div>${self._view.personal}></div>
            <label class="form-check-label align-middle" for="personal">Enable Personal Mode ${self._view.warnPersonalMode}></label>
          </div>
        </div>
      </div>
      `
    self._view.gistToken = yo`
      <div class="${css.info} card">
        <div class="card-body">
          <h6 class="${css.title} card-title">Gist Access Token</h6>
          <p class="">Manage the access token used to publish to Gist and retrieve Github contents.</p>
          <p class="">Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only 'create gist' permission.</p>
          <p class="${css.crowNoFlex}"><a target="_blank" href="https://github.com/settings/tokens">https://github.com/settings/tokens</a></p>
          <div class="${css.crowNoFlex}">${self._view.gistToken}</div>
        </div>
      </div>`
    self._view.config.themes = yo`
      <div class="${css.info} card">
        <div class="card-body">
          <h6 class="${css.title} card-title">Themes</h6>
          <div class="card-text">
            <div class="${css.frow} form-check ${css.crow}">
              ${self._view.theme.light}
              <label class="form-check-label" for="themeLight">Light Theme</label>
            </div>
            <div class="${css.frow} form-check ${css.crow}">
              ${self._view.theme.dark}
              <label class="form-check-label" for="themeDark">Dark Theme</label>
            </div>
            <div class="${css.frow} form-check ${css.crow}">
              ${self._view.theme.clean}
              <label class="form-check-label" for="themeClean">Clean Theme</label>
            </div>
          </div>
        </div>
      </div>`
    self._view.el = yo`
      <div class="${css.settingsTabView}" id="settingsView">
        ${self._view.config.general}
        ${self._view.gistToken}
        ${self._view.config.themes}
      </div>`

    function onchangeGenerateContractMetadata (event) {
      self._deps.config.set('settings/generate-contract-metadata', !self._deps.config.get('settings/generate-contract-metadata'))
    }
    function onchangeOption (event) {
      self._deps.config.set('settings/always-use-vm', !self._deps.config.get('settings/always-use-vm'))
    }
    function onswitch2darkTheme (event) {
      styleGuide.switchTheme('dark')
    }
    function onswitch2lightTheme (event) {
      styleGuide.switchTheme('light')
    }
    function onswitch2cleanTheme (event) {
      styleGuide.switchTheme('clean')
    }
    function onchangePersonal (event) {
      self._deps.config.set('settings/personal-mode', !self._deps.config.get('settings/personal-mode'))
    }
    styleGuide.switchTheme()
    return self._view.el
  }
}

const css = csjs`
  .settingsTabView {
    padding: 2%;
  }
  .info {
    margin-bottom: .6rem;
    word-break: break-word;
    font-size: .8rem;
  }
  .info h7 {
    margin-bottom: .5rem;
  }
  .title {
    // font-size: 1.1em;
    // font-weight: bold;
    // margin-bottom: 1em;
  }
  .frow {
    margin-bottom: .5rem;
  }
  .crow {
    // display: flex;
    // overflow: auto;
    // clear: both;
    // padding: .2em;
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
    width: inherit;
  }
  input[type=radio] {
    margin-top: 2px;
  }
  .pluginTextArea {
    font-family: unset;
  }

  .removePlugin {
    cursor: pointer;
  }
  .icon {
    margin-right: .5em;
  }
  .savegisttoken {
    margin-left: 5px;
  }
  .aPlugin {
    display: inline-block;
    padding-left: 10px;
    padding-top: 4px;
    padding-bottom: 6px;
    max-width: 100px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    vertical-align: middle;
  }
  .removePlugin{
    padding-left: 7px;
    padding-right: 7px;
    margin-left: 10px;
  }
  .inline {
    display: inline;
    width: 50%;
  }
`
