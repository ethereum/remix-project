/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React from 'react'
import { AppAction, AppState } from '@remix-ui/app'
import { PluginViewWrapper } from '@remix-ui/helper'
import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { RemixUiTemplateExplorerModal, RemixUiTemplateExplorerModalProps } from 'libs/remix-ui/template-explorer-modal/src/lib/remix-ui-template-explorer-modal'

const pluginProfile = {
  name: 'remix-template-explorer-modal',
  displayName: 'Remix Generic Modal',
  description: 'Remix Generic Modal for every type of content meant for a modal',
  methods: ['openModal']
}

export class TemplateExplorerModalPlugin extends Plugin {
  element: HTMLDivElement
  dispatch: React.Dispatch<any> = () => { }
  event: any
  appStateDispatch: any
  constructor() {
    super(pluginProfile)
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'remix-template-explorer-modal')
    this.dispatch = () => { }
    this.event = new EventEmitter()
  }

  async onActivation(): Promise<void> {

  }

  onDeactivation(): void {
    this.element.remove()
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  setAppStateDispatch(appStateDispatch: React.Dispatch<AppAction>) {
    this.appStateDispatch = appStateDispatch
  }

  render() {
    return (
      <div id="inner-remix-template-explorer-modal">
        <PluginViewWrapper plugin={this} useAppContext={true} />
      </div>
    )
  }

  renderComponent(): void {
    this.dispatch({
      element: this.element,
    })
  }

  updateComponent(state: RemixUiTemplateExplorerModalProps, appState: AppState) {
    return (
      <RemixUiTemplateExplorerModal
        appState={appState}
        dispatch={this.dispatch}
        plugin={this}
      />
    )
  }
}
