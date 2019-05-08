var yo = require('yo-yo')
const globalRegistry = require('../../global/registry')
var tooltip = require('../ui/tooltip')
var copyToClipboard = require('../ui/copy-to-clipboard')
var EventManager = require('../../lib/events')
var css = require('./styles/settings-tab-styles')
import { BaseApi } from 'remix-plugin'

const profile = {
  name: 'settings',
  displayName: 'Settings',
  methods: [],
  events: [],
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMTUyIDg5NnEwLTEwNi03NS0xODF0LTE4MS03NS0xODEgNzUtNzUgMTgxIDc1IDE4MSAxODEgNzUgMTgxLTc1IDc1LTE4MXptNTEyLTEwOXYyMjJxMCAxMi04IDIzdC0yMCAxM2wtMTg1IDI4cS0xOSA1NC0zOSA5MSAzNSA1MCAxMDcgMTM4IDEwIDEyIDEwIDI1dC05IDIzcS0yNyAzNy05OSAxMDh0LTk0IDcxcS0xMiAwLTI2LTlsLTEzOC0xMDhxLTQ0IDIzLTkxIDM4LTE2IDEzNi0yOSAxODYtNyAyOC0zNiAyOGgtMjIycS0xNCAwLTI0LjUtOC41dC0xMS41LTIxLjVsLTI4LTE4NHEtNDktMTYtOTAtMzdsLTE0MSAxMDdxLTEwIDktMjUgOS0xNCAwLTI1LTExLTEyNi0xMTQtMTY1LTE2OC03LTEwLTctMjMgMC0xMiA4LTIzIDE1LTIxIDUxLTY2LjV0NTQtNzAuNXEtMjctNTAtNDEtOTlsLTE4My0yN3EtMTMtMi0yMS0xMi41dC04LTIzLjV2LTIyMnEwLTEyIDgtMjN0MTktMTNsMTg2LTI4cTE0LTQ2IDM5LTkyLTQwLTU3LTEwNy0xMzgtMTAtMTItMTAtMjQgMC0xMCA5LTIzIDI2LTM2IDk4LjUtMTA3LjV0OTQuNS03MS41cTEzIDAgMjYgMTBsMTM4IDEwN3E0NC0yMyA5MS0zOCAxNi0xMzYgMjktMTg2IDctMjggMzYtMjhoMjIycTE0IDAgMjQuNSA4LjV0MTEuNSAyMS41bDI4IDE4NHE0OSAxNiA5MCAzN2wxNDItMTA3cTktOSAyNC05IDEzIDAgMjUgMTAgMTI5IDExOSAxNjUgMTcwIDcgOCA3IDIyIDAgMTItOCAyMy0xNSAyMS01MSA2Ni41dC01NCA3MC41cTI2IDUwIDQxIDk4bDE4MyAyOHExMyAyIDIxIDEyLjV0OCAyMy41eiIvPjwvc3ZnPg==',
  description: 'Remix-IDE settings',
  kind: 'settings',
  location: 'swapPanel'
}

module.exports = class SettingsTab extends BaseApi {
  constructor (config, editor, appManager) {
    super(profile)
    this.config = config
    this.editor = editor
    this.appManager = appManager
    this._components = {}
    this._deps = {
      themeModule: globalRegistry.get('themeModule').api
    }
    this._view = { /* eslint-disable */
      el: null,
      optionVM: null, personal: null, warnPersonalMode: null, generateContractMetadata: null,
      config: {
        general: null, themes: null
      }
    } /* eslint-enable */
    this.event = new EventManager()
  }

  createThemeCheckies () {
    let themes = this._deps.themeModule.getThemes()
    const onswitchTheme = (event, name) => {
      this._deps.themeModule.switchTheme(name)
    }
    if (themes) {
      return yo`<div class="card-text themes-container">
        ${themes.map((aTheme) => {
          let el = yo`<div class="${css.frow} form-check ${css.crow}">
          <input type="radio" onchange=${event => { onswitchTheme(event, aTheme.name) }} class="align-middle form-check-input" name="theme" id="${aTheme.name}"   >
          <label class="form-check-label" for="${aTheme.name}">${aTheme.name} (${aTheme.quality})</label>
        </div>`
          if (this._deps.themeModule.active === aTheme.name) el.querySelector('input').setAttribute('checked', 'checked')
          return el
        })}
      </div>`
    }
  }

  render () {
    const self = this
    if (self._view.el) return self._view.el

    // Gist settings
    var gistAccessToken = yo`<input id="gistaccesstoken" type="password" class="form-control mb-2 ${css.inline}" placeholder="Token">`
    var token = this.config.get('settings/gist-access-token')
    if (token) gistAccessToken.value = token
    var gistAddToken = yo`<input class="${css.savegisttoken} btn btn-sm btn-primary" id="savegisttoken" onclick=${() => { this.config.set('settings/gist-access-token', gistAccessToken.value); tooltip('Access token saved') }} value="Save" type="button">`
    var gistRemoveToken = yo`<input class="btn btn-sm btn-primary" id="removegisttoken" onclick=${() => { gistAccessToken.value = ''; this.config.set('settings/gist-access-token', ''); tooltip('Access token removed') }} value="Remove" type="button">`
    this._view.gistToken = yo`<div class="${css.checkboxText}">${gistAccessToken}${copyToClipboard(() => this.config.get('settings/gist-access-token'))}${gistAddToken}${gistRemoveToken}</div>`
    this._view.optionVM = yo`<input onchange=${onchangeOption} class="align-middle form-check-input" id="alwaysUseVM" type="checkbox">`
    if (this.config.get('settings/always-use-vm')) this._view.optionVM.setAttribute('checked', '')
    this._view.personal = yo`<input onchange=${onchangePersonal} id="personal" type="checkbox" class="align-middle form-check-input">`
    if (this.config.get('settings/personal-mode')) this._view.personal.setAttribute('checked', '')
    var warnText = `Transaction sent over Web3 will use the web3.personal API - be sure the endpoint is opened before enabling it.
    This mode allows to provide the passphrase in the Remix interface without having to unlock the account.
    Although this is very convenient, you should completely trust the backend you are connected to (Geth, Parity, ...).
    It is not recommended (and also most likely not relevant) to use this mode with an injected provider (Mist, Metamask, ...) or with JavaScript VM.
    Remix never persist any passphrase.`.split('\n').map(s => s.trim()).join(' ')
    this._view.warnPersonalMode = yo`<i title=${warnText} class="${css.icon} fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>`
    this._view.generateContractMetadata = yo`<input onchange=${onchangeGenerateContractMetadata} id="generatecontractmetadata" type="checkbox" class="form-check-input">`

    if (this.config.get('settings/generate-contract-metadata')) this._view.generateContractMetadata.setAttribute('checked', '')

    this._view.pluginInput = yo`<textarea rows="4" cols="70" id="plugininput" type="text" class="${css.pluginTextArea}" ></textarea>`

    this._view.themes = this._deps.themeModule.getThemes()
    this._view.themesCheckBoxes = this.createThemeCheckies()
    this._view.config.homePage = yo`

    <div class="${css.info} card">
      <div class="card-body">
      <h6 class="${css.title} card-title">Have a question?</h6>
      <button class="btn btn-primary sm-1" onclick="${() => { window.open('https://gitter.im/ethereum/remix') }}">Gitter Channel</button>
      </div>
    </div>`
    this._view.config.general = yo`
      <div class="${css.info} card">
        <div class="card-body">
          <h6 class="${css.title} card-title">General settings</h6>
          <div class="form-check ${css.frow}">
            <div>${this._view.generateContractMetadata}</div>
            <label class="form-check-label align-middle" for="generatecontractmetadata">Generate contract metadata. Generate a JSON file in the contract folder. Allows to specify library addresses the contract depends on. If nothing is specified, Remix deploys libraries automatically.</label>
          </div>
          <div class="form-check ${css.frow}">
            <div>${this._view.optionVM}</div>
            <label class="form-check-label align-middle" for="alwaysUseVM">Always use Ethereum VM at Load</label>
          </div>
          <div class="form-check ${css.frow}">
            <div><input id="editorWrap" class="form-check-input align-middle" type="checkbox" onchange=${function () { this.editor.resize(this.checked) }}></div>
            <label class="form-check-label align-middle" for="editorWrap">Text Wrap</label>
          </div>
          <div class="form-check ${css.frow}">
            <div>${this._view.personal}></div>
            <label class="form-check-label align-middle" for="personal">Enable Personal Mode ${this._view.warnPersonalMode}></label>
          </div>
        </div>
      </div>
      `
    this._view.gistToken = yo`
      <div class="${css.info} card">
        <div class="card-body">
          <h6 class="${css.title} card-title">Gist Access Token</h6>
          <p class="">Manage the access token used to publish to Gist and retrieve Github contents.</p>
          <p class="">Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only 'create gist' permission.</p>
          <p class="${css.crowNoFlex}"><a target="_blank" href="https://github.com/settings/tokens">https://github.com/settings/tokens</a></p>
          <div class="${css.crowNoFlex}">${this._view.gistToken}</div>
        </div>
      </div>`
    this._view.config.themes = yo`
      <div class="${css.info} card">
        <div class="card-body">
          <h6 class="${css.title} card-title">Themes</h6>
            ${this._view.themesCheckBoxes}
        </div>
      </div>`
    this._view.el = yo`
      <div class="${css.settingsTabView}" id="settingsView">
        ${this._view.config.homePage}
        ${this._view.config.general}
        ${this._view.gistToken}
        ${this._view.config.themes}
      </div>`

    function onchangeGenerateContractMetadata (event) {
      self.config.set('settings/generate-contract-metadata', !self.config.get('settings/generate-contract-metadata'))
    }
    function onchangeOption (event) {
      self.config.set('settings/always-use-vm', !self.config.get('settings/always-use-vm'))
    }
    function onchangePersonal (event) {
      self.config.set('settings/personal-mode', !self.config.get('settings/personal-mode'))
    }

    this._deps.themeModule.switchTheme()
    return this._view.el
  }
}
