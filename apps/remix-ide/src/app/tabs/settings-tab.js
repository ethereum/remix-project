import React from 'react' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import ReactDOM from 'react-dom'
import * as packageJson from '../../../../../package.json'
import { RemixUiSettings } from '@remix-ui/settings' //eslint-disable-line
import Registry from '../state/registry'

const profile = {
  name: 'settings',
  displayName: 'Settings',
  methods: ['get'],
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
  constructor (config, editor) {
    super(profile)
    this.config = config
    this.editor = editor
    this._deps = {
      themeModule: Registry.getInstance().get('themeModule').api
    }
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'settingsTab')
    this.useMatomoAnalytics = null
  }

  onActivation () {
  }

  render() {
    return (
      <div id='settingsTab'>
      <RemixUiSettings
        config={this.config}
        editor={this.editor}
        _deps={this._deps}
        useMatomoAnalytics={this.useMatomoAnalytics}
      />
      </div>
    );
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiSettings
        config = { this.config }
        editor = { this.editor }
        _deps = { this._deps }
        useMatomoAnalytics = {this.useMatomoAnalytics}
      />,
      this.element
    )
  }

  get (key) {
    return this.config.get(key)
  }

  updateMatomoAnalyticsChoice (isChecked) {
    this.config.set('settings/matomo-analytics', isChecked)
    this.useMatomoAnalytics = isChecked
    this.renderComponent()
  }
}
