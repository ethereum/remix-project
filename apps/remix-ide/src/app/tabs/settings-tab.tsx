import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import ReactDOM from 'react-dom'
import * as packageJson from '../../../../../package.json'
import { RemixUiSettings } from '@remix-ui/settings' //eslint-disable-line
import Registry from '../state/registry'
import { ViewReactPlugin } from '../plugins/viewReactPlugin'

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

module.exports = class SettingsTab extends ViewReactPlugin {
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
    
    return (
      <div id='settingsTab'>
        <ViewPluginUI plugin={this} />
      </div>
    );
  }

  updateComponent(state: any){
    console.log('updateComponent', state)
    return <RemixUiSettings
    config={state.config}
    editor={state.editor}
    _deps={state._deps}
    useMatomoAnalytics={state.useMatomoAnalytics}
    themeModule = {state._deps.themeModule}
  />
  }

  renderComponent () {
    console.log('dispatching', this.useMatomoAnalytics, this.dispatch)
    this.dispatch(this)
  }

  get (key) {
    return this.config.get(key)
  }

  updateMatomoAnalyticsChoice (isChecked) {
    console.log('update matomo')
    this.config.set('settings/matomo-analytics', isChecked)
    this.useMatomoAnalytics = isChecked
    this.dispatch({
      ...this
    })
  }
}


export interface IViewPluginUI {
  plugin: any
}

export const ViewPluginUI = (props: IViewPluginUI) => {

  const [state, setState] = useState<any>(null)

  useEffect(() => {
    console.log(props.plugin)
    if(props.plugin.setDispatch){
      props.plugin.setDispatch(setState)
    }
  }, [])

  useEffect(() => {
    console.log(state)
  }, [state])

  return (
    <>{state? 
      <div>{props.plugin.updateComponent(state)}</div>
    :<></>
    }</>
  )
}