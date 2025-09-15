/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React from 'react'
import { AppAction, AppState } from '@remix-ui/app'
import { PluginViewWrapper } from '@remix-ui/helper'
import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { RemixUiGenericModal, RemixUiGenericModalProps } from 'libs/remix-ui/generic-modal/src/lib/remix-ui-generic-modal'

const pluginProfile = {
  name: 'remix-generic-modal',
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
    this.element.setAttribute('id', 'remix-generic-modal')
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
      <div id="inner-remix-generic-modal">
        <PluginViewWrapper plugin={this} useAppContext={true} />
      </div>
    )
  }

  renderComponent(): void {
    this.dispatch({
      element: this.element,
    })
  }

  updateComponent(state: RemixUiGenericModalProps, appState: AppState) {
    return (
      <RemixUiGenericModal
        appState={appState}
        dispatch={this.dispatch}
        plugin={this}
      />
    )
  }
}
