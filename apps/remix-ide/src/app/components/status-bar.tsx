import React from 'react'
import { EventEmitter } from 'events'
import { Plugin } from '@remixproject/engine'
import packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import { PluginProfile, StatusBarInterface } from '../../types'
import { RemixUIStatusBar } from '@remix-ui/statusbar'
import { FilePanelType } from '@remix-ui/workspace'
import { VerticalIcons } from './vertical-icons'

const statusBarProfile: PluginProfile = {
  name: 'statusBar',
  displayName: 'Status Bar',
  description: 'Remix IDE status bar panel',
  methods: [],
  version: packageJson.version,
}

export class StatusBar extends Plugin implements StatusBarInterface {
  htmlElement: HTMLDivElement
  events: EventEmitter
  filePanelPlugin: FilePanelType
  verticalIcons: VerticalIcons
  dispatch: React.Dispatch<any> = () => {}
  currentWorkspaceName: string = ''
  constructor(filePanel: FilePanelType, veritcalIcons: VerticalIcons) {
    super(statusBarProfile)
    this.filePanelPlugin = filePanel
    this.verticalIcons = veritcalIcons
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
      plugins: this,
    })
  }

  updateComponent(state: any) {
    return <RemixUIStatusBar statusBarPlugin={state.plugins} />
  }

  render() {
    return (
      <div data-id="status-bar-container">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }
}
