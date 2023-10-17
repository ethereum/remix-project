import React from 'react'
import { ViewPlugin } from '@remixproject/engine-web'
import {PluginViewWrapper} from '@remix-ui/helper'
import { RemixAppManager } from '../../remixAppManager'
import { RemixUiCompileDetails } from '@remix-ui/solidity-compile-details'

const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'compilationDetails',
  displayName: 'Solidity Compile Details',
  description: 'Displays details from solidity compiler',
  location: 'mainPanel',
  methods: ['showDetails'],
  events: []
}

export class CompilationDetailsPlugin extends ViewPlugin {
  dispatch: React.Dispatch<any> = () => {}
  appManager: RemixAppManager
  element: HTMLDivElement
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'compileDetails')
  }

  async onActivation() {
    this.renderComponent()
    // await this.call('tabs', 'focus', 'compilationdetails')
    _paq.push(['trackEvent', 'plugin', 'activated', 'compilationDetails'])
  }

  onDeactivation(): void {

  }

  async showDetails() {
    await this.call('tabs', 'focus', 'compilationdetails')
    this.renderComponent()
  }

  setDispatch(dispatch: React.Dispatch<any>): void {
    this.dispatch = dispatch
  }
  render() {
    return (
      <div id="compileDetails">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  renderComponent() {
    this.dispatch({
      ...this

    })
  }

  updateComponent(state: any) {
    return (
      <RemixUiCompileDetails
        plugin={this}
      />
    )
  }

}
