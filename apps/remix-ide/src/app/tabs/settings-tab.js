import React from 'react' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import ReactDOM from 'react-dom'
import * as packageJson from '../../../../../package.json'
import { RemixUiSettings } from '@remix-ui/settings' //eslint-disable-line
const globalRegistry = require('../../global/registry')
const EventManager = require('../../lib/events')

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
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'settingsTab')
  }

  onActivation () {
    this.renderComponent()
  }

  render () {
    return this.element
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiSettings
        config = { this.config }
        editor = { this.editor }
        _deps = { this._deps }
      />,
      this.element
    )
  }

  getGithubAccessToken () {
    return this.config.get('settings/gist-access-token')
  }

  updateMatomoAnalyticsChoice (isChecked) {
    this.config.set('settings/matomo-analytics', isChecked)
    if (isChecked) {
      this._view.useMatomoAnalytics.setAttribute('checked', '')
      this._view.useMatomoAnalyticsLabel.classList.remove('text-secondary')
      this._view.useMatomoAnalyticsLabel.classList.add('text-dark')
    } else {
      this._view.useMatomoAnalytics.removeAttribute('checked')
      this._view.useMatomoAnalyticsLabel.classList.remove('text-dark')
      this._view.useMatomoAnalyticsLabel.classList.add('text-secondary')
    }
  }
}
