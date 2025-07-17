/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React from 'react'
import { RemixUiTopbar } from '@remix-ui/top-bar'
import packageJson from '../../../../../package.json'
import { EventEmitter } from 'events'
import { CustomRemixApi, ICustomRemixApi } from '@remix-api'
import { Plugin } from '@remixproject/engine'
import { PluginViewWrapper } from '@remix-ui/helper'
import { AppAction } from 'libs/remix-ui/app/src/lib/remix-app/actions/app'
import FilePanel from '../panels/file-panel'

const TopBarProfile = {
  name: 'topbar',
  displayName: 'Top Bar',
  description: '',
  version: packageJson.version,
  icon: '',
  methods: [],
  events: []
}

export class Topbar extends Plugin<any, CustomRemixApi> {
  dispatch: React.Dispatch<any> = () => { }
  appStateDispatch: React.Dispatch<AppAction> = () => { }
  htmlElement: HTMLDivElement
  events: EventEmitter
  filePanel: FilePanel

  constructor(filePanel: FilePanel) {
    super(TopBarProfile)
    this.filePanel = filePanel
  }

  onActivation(): void {
    this.renderComponent()
  }

  onDeactivation(): void {

  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  setAppStateDispatch(appStateDispatch: React.Dispatch<AppAction>) {
    this.appStateDispatch = appStateDispatch
  }

  renderComponent() {
    this.dispatch({
      plugins: this,
    })
  }

  updateComponent(state: any) {
    return <RemixUiTopbar plugin={this} />
  }

  render() {
    return (
      <div data-id="top-bar-container">
        <PluginViewWrapper useAppContext={true} plugin={this} />
      </div>
    )
  }

}
