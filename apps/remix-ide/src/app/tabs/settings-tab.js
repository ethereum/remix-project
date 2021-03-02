import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
const yo = require('yo-yo')
const globalRegistry = require('../../global/registry')
const tooltip = require('../ui/tooltip')
const copyToClipboard = require('../ui/copy-to-clipboard')
const EventManager = require('../../lib/events')
const css = require('./styles/settings-tab-styles')
const _paq = window._paq = window._paq || []

const profile = {
  name: 'settings',
  displayName: 'Settings',
  methods: ['getGithubAccessToken'],
  events: [],
  icon: 'assets/img/settings.webp',
  description: 'Remix-IDE settings',
  kind: 'settings',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/settings.html',
  version: packageJson.version,
  permission: true
}

module.exports = class SettingsTab extends ViewPlugin {
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
      optionVM: null,
      optionVMLabel: null,
      personal: null,
      personalLabel: null,
      useMatomoAnalytics: null,
      useMatomoAnalyticsLabel: null,
      useMatomoAnalyticsMode: null,
      warnPersonalMode: null,
      generateContractMetadata: null,
      generateContractMetadataLabel: null,
      config: {
        general: null, themes: null
      },
      textWrap: null,
      textWrapLabel: null
    } /* eslint-enable */
    this.event = new EventManager()
  }

  createThemeCheckies () {
    const themes = this._deps.themeModule.getThemes()
    const onswitchTheme = (event, name) => {
      this._deps.themeModule.switchTheme(name)
    }
    if (themes) {
      return yo`<div class="card-text themes-container">
        ${themes.map((aTheme) => {
          const el = yo`<div class="radio custom-control custom-radio mb-1 form-check ${css.crow}">
          <input type="radio" onchange=${event => { onswitchTheme(event, aTheme.name) }} class="align-middle custom-control-input" name="theme" id="${aTheme.name}" data-id="settingsTabTheme${aTheme.name}">
          <label class="form-check-label custom-control-label" data-id="settingsTabThemeLabel${aTheme.name}" for="${aTheme.name}">${aTheme.name} (${aTheme.quality})</label>
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
    const token = this.config.get('settings/gist-access-token')
    const gistAccessToken = yo`<input id="gistaccesstoken" data-id="settingsTabGistAccessToken" type="password" class="form-control">`
    if (token) gistAccessToken.value = token
    const removeToken = () => { self.config.set('settings/gist-access-token', ''); gistAccessToken.value = ''; tooltip('Access token removed') }
    const saveToken = () => {
      this.config.set('settings/gist-access-token', gistAccessToken.value)
      tooltip('Access token has been saved. RELOAD the page to apply it.')
    }
    const gistAddToken = yo`<input class="btn btn-sm btn-primary ml-2" id="savegisttoken" data-id="settingsTabSaveGistToken" onclick=${() => saveToken()} value="Save" type="button">`
    const gistRemoveToken = yo`<button class="btn btn-sm btn-secondary ml-2" id="removegisttoken" data-id="settingsTabRemoveGistToken" title="Delete Github access token" onclick=${() => removeToken()}>Remove</button>`
    this._view.gistToken = yo`
      <div class="text-secondary mb-0 h6">
        ${gistAccessToken}
        <div class="d-flex justify-content-end pt-2">
          ${copyToClipboard(() => gistAccessToken.value)}${gistAddToken}${gistRemoveToken}
        </div>
        <p class="pt-1">
          <i class="${css.icon} fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>
          <span class="text-warning">Please reload Remix after having saved the token.</span>
        </p>
      </div>
    `
    this._view.optionVM = yo`<input onchange=${onchangeOption} class="custom-control-input" id="alwaysUseVM" data-id="settingsTabAlwaysUseVM" type="checkbox">`
    this._view.optionVMLabel = yo`<label class="form-check-label custom-control-label align-middle" for="alwaysUseVM">Always use Ethereum VM at Load</label>`
    if (this.config.get('settings/always-use-vm') === undefined) this.config.set('settings/always-use-vm', true)
    if (this.config.get('settings/always-use-vm')) this._view.optionVM.setAttribute('checked', '')
    elementStateChanged(self._view.optionVMLabel, !this.config.get('settings/always-use-vm'))

    this._view.textWrap = yo`<input id="editorWrap" class="custom-control-input" type="checkbox" onchange=${textWrapEvent}>`
    this._view.textWrapLabel = yo`<label class="form-check-label custom-control-label align-middle" for="editorWrap">Text Wrap</label>`
    if (this.config.get('settings/text-wrap')) this._view.textWrap.setAttribute('checked', '')
    elementStateChanged(self._view.textWrapLabel, !this.config.get('settings/text-wrap'))

    const warnText = `Transaction sent over Web3 will use the web3.personal API - be sure the endpoint is opened before enabling it.
    This mode allows to provide the passphrase in the Remix interface without having to unlock the account.
    Although this is very convenient, you should completely trust the backend you are connected to (Geth, Parity, ...).
    Remix never persist any passphrase.`.split('\n').map(s => s.trim()).join(' ')

    this._view.personal = yo`<input onchange=${onchangePersonal} id="personal" type="checkbox" class="custom-control-input">`
    this._view.warnPersonalMode = yo`<i class="${css.icon} fas fa-exclamation-triangle text-warning" aria-hidden="true"></i>`
    this._view.personalLabel = yo`<label class="form-check-label custom-control-label align-middle" for="personal"> ${this._view.warnPersonalMode} Enable Personal Mode for web3 provider. ${warnText}></label>`
    if (this.config.get('settings/personal-mode')) this._view.personal.setAttribute('checked', '')
    elementStateChanged(self._view.personalLabel, !this.config.get('settings/personal-mode'))

    this._view.useMatomoAnalytics = yo`<input onchange=${onchangeMatomoAnalytics} id="settingsMatomoAnalytics" type="checkbox" class="custom-control-input">`
    this._view.useMatomoAnalyticsLabel = yo`
      <label class="form-check-label custom-control-label align-middle" for="settingsMatomoAnalytics">
        <span>Enable Matomo Analytics. We do not collect personally identifiable information (PII). The info is used to improve the site’s UX & UI. See more about</span>
        <a href="https://remix-ide.readthedocs.io/en/latest/FAQ.html#analytics" target="_blank">Analytics in Remix IDE</a> <span>&</span> <a target="_blank" href="https://matomo.org/free-software">Matomo</a>

      </label>
    `
    if (this.config.get('settings/matomo-analytics')) {
      this._view.useMatomoAnalytics.setAttribute('checked', '')
      _paq.push(['forgetUserOptOut'])
    } else {
      _paq.push(['optUserOut'])
    }
    elementStateChanged(self._view.useMatomoAnalyticsLabel, !this.config.get('settings/matomo-analytics'))

    this._view.generateContractMetadata = yo`<input onchange=${onchangeGenerateContractMetadata} id="generatecontractmetadata" data-id="settingsTabGenerateContractMetadata" type="checkbox" class="custom-control-input">`
    this._view.generateContractMetadataLabel = yo`<label class="form-check-label custom-control-label align-middle" data-id="settingsTabGenerateContractMetadataLabel" for="generatecontractmetadata">Generate contract metadata. Generate a JSON file in the contract folder. Allows to specify library addresses the contract depends on. If nothing is specified, Remix deploys libraries automatically.</label>`
    if (this.config.get('settings/generate-contract-metadata') === undefined) this.config.set('settings/generate-contract-metadata', true)
    if (this.config.get('settings/generate-contract-metadata')) this._view.generateContractMetadata.setAttribute('checked', '')
    elementStateChanged(self._view.generateContractMetadataLabel, !this.config.get('settings/generate-contract-metadata'))

    this._view.pluginInput = yo`<textarea rows="4" cols="70" id="plugininput" type="text" class="${css.pluginTextArea}" ></textarea>`

    this._view.themes = this._deps.themeModule.getThemes()
    this._view.themesCheckBoxes = this.createThemeCheckies()

    this._view.config.general = yo`
      <div class="${css.info} border-top">
        <div class="card-body pt-3 pb-2">
          <h6 class="${css.title} card-title">General settings</h6>
          <div class="mt-2 custom-control custom-checkbox mb-1">
            ${this._view.generateContractMetadata}
            ${this._view.generateContractMetadataLabel}
          </div>
          <div class="fmt-2 custom-control custom-checkbox mb-1">
            ${this._view.optionVM}
            ${this._view.optionVMLabel}
          </div>
          <div class="mt-2 custom-control custom-checkbox mb-1">
            ${this._view.textWrap}
            ${this._view.textWrapLabel}
          </div>
          <div class="custom-control custom-checkbox mb-1">
            ${this._view.personal}
            ${this._view.personalLabel}
          </div>
          <div class="custom-control custom-checkbox mb-1">
            ${this._view.useMatomoAnalytics}
            ${this._view.useMatomoAnalyticsLabel}
          </div>
        </div>
      </div>
      `
    this._view.gistToken = yo`
      <div class="${css.info} border-top">
        <div class="card-body pt-3 pb-2">
          <h6 class="${css.title} card-title">Github Access Token</h6>
          <p class="mb-1">Manage the access token used to publish to Gist and retrieve Github contents.</p>
          <p class="">Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only 'create gist' permission.</p>
          <p class="${css.crowNoFlex} mb-1"><a class="text-primary ${css.text}" target="_blank" href="https://github.com/settings/tokens">https://github.com/settings/tokens</a></p>
          <div class="${css.crowNoFlex}"><label>TOKEN:</label>${this._view.gistToken}</div>
        </div>
      </div>`
    this._view.config.themes = yo`
      <div class="${css.info} border-top">
        <div class="card-body pt-3 pb-2">
          <h6 class="${css.title} card-title">Themes</h6>
            ${this._view.themesCheckBoxes}
        </div>
      </div>`
    this._view.el = yo`
      <div id="settingsView" data-id="settingsTabSettingsView">
        ${this._view.config.general}
        ${this._view.gistToken}
        ${this._view.config.themes}
      </div>`

    function onchangeGenerateContractMetadata (event) {
      const isChecked = self.config.get('settings/generate-contract-metadata')

      self.config.set('settings/generate-contract-metadata', !isChecked)
      elementStateChanged(self._view.generateContractMetadataLabel, isChecked)
    }

    function onchangeOption (event) {
      const isChecked = self.config.get('settings/always-use-vm')

      self.config.set('settings/always-use-vm', !isChecked)
      elementStateChanged(self._view.optionVMLabel, isChecked)
    }

    function textWrapEvent (event) {
      const isChecked = self.config.get('settings/text-wrap')

      self.config.set('settings/text-wrap', !isChecked)
      elementStateChanged(self._view.textWrapLabel, isChecked)
      self.editor.resize(!isChecked)
    }

    function onchangePersonal (event) {
      const isChecked = self.config.get('settings/personal-mode')

      self.config.set('settings/personal-mode', !isChecked)
      elementStateChanged(self._view.personalLabel, isChecked)
    }

    function onchangeMatomoAnalytics (event) {
      const isChecked = self.config.get('settings/matomo-analytics')

      self.config.set('settings/matomo-analytics', !isChecked)
      elementStateChanged(self._view.useMatomoAnalyticsLabel, isChecked)
      if (event.target.checked) {
        _paq.push(['forgetUserOptOut'])
      } else {
        _paq.push(['optUserOut'])
      }
    }

    function elementStateChanged (el, isChanged) {
      if (isChanged) {
        el.classList.remove('text-dark')
        el.classList.add('text-secondary')
      } else {
        el.classList.add('text-dark')
        el.classList.remove('text-secondary')
      }
    }

    this._deps.themeModule.switchTheme()
    return this._view.el
  }

  getGithubAccessToken () {
    return this.config.get('settings/gist-access-token')
  }
}
