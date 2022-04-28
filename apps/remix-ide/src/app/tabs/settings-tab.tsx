import React from 'react' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import { RemixUiSettings } from '@remix-ui/settings' //eslint-disable-line
import Registry from '../state/registry'
import { PluginViewWrapper } from '@remix-ui/helper'

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
  config: any = {}
  editor: any
  private _deps: {
    themeModule: any // eslint-disable-line
    
  }
  element: HTMLDivElement
  public useMatomoAnalytics: any
  dispatch: React.Dispatch<any> = () => {}
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

  setDispatch (dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  render() {      
    return <div id='settingsTab'>
        <PluginViewWrapper plugin={this} />
      </div>
  }

  updateComponent(state: any){
    return <RemixUiSettings
    config={state.config}
    editor={state.editor}
    _deps={state._deps}
    useMatomoAnalytics={state.useMatomoAnalytics}
    themeModule = {state._deps.themeModule}
  />
  }

  renderComponent () {
    this.dispatch(this)
  }

  get (key) {
    return this.config.get(key)
  }

  updateMatomoAnalyticsChoice (isChecked) {
    this.config.set('settings/matomo-analytics', isChecked)
    this.useMatomoAnalytics = isChecked
    this.dispatch({
      ...this
    })
  }
}