import React from 'react'
import { EventEmitter } from 'events'
import { Plugin } from '@remixproject/engine'
import packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import { PluginProfile } from '../../types'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RemixUIStatusBar } from '@remix-ui/statusbar'

const statusBarProfile: PluginProfile = {
  name: 'statusBar',
  displayName: 'Status Bar',
  description: 'Remix IDE status bar panel',
  version: packageJson.version
}

export class StatusBar extends Plugin {
  htmlElement: HTMLDivElement
  events: EventEmitter
  dispatch: React.Dispatch<any> = () => {}
  constructor() {
    super(statusBarProfile)
    this.events = new EventEmitter()
    this.htmlElement = document.createElement('div')
    this.htmlElement.setAttribute('id', 'status-bar')
  }

  onActivation(): void {
    this.renderComponent()
  }
  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  renderComponent() {
    this.dispatch({
      plugins: this
    })
  }

  updateComponent(state: any) {
    return <RemixUIStatusBar statusBarPlugin={state.plugins} />
  }

  render() {
    <div data-id="status-bar-container">
      test
      <PluginViewWrapper plugin={this} />
    </div>
  }

}
