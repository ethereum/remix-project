import React from 'react'
import { ViewPlugin } from '@remixproject/engine-web'
import {PluginViewWrapper} from '@remix-ui/helper'
import { RemixAppManager } from '../../remixAppManager'
import { RemixUiVyperCompileDetails } from '@remix-ui/vyper-compile-details'
//@ts-ignore
const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'vyperCompilationDetails',
  displayName: 'Vyper Compile Details',
  description: 'Displays details from vyper compiler',
  location: 'mainPanel',
  methods: ['showDetails'],
  events: []
}

export class VyperCompilationDetailsPlugin extends ViewPlugin {
  dispatch: React.Dispatch<any> = () => {}
  appManager: RemixAppManager
  element: HTMLDivElement
  payload: any
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'vypercompileDetails')
    this.payload = {
      contractProperties: {} as any,
      selectedContract: '',
      help: {} as any,
      insertValue: {} as any,
      saveAs: {} as any,
    }
  }

  async onActivation() {
    await this.call('tabs', 'focus', 'vyperCompilationDetails')
    this.renderComponent()
    _paq.push(['trackEvent', 'plugin', 'activated', 'vyperCompilationDetails'])
  }

  onDeactivation(): void {

  }

  async showDetails(sentPayload: any) {
    console.log(sentPayload )
    const contractName = Object.entries(sentPayload).find(([key, value]) =>  key )
    await this.call('tabs', 'focus', 'vyperCompilationDetails')
    this.profile.displayName = `${contractName}`
    this.renderComponent()
    this.payload = sentPayload
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
      ...this,
      ...this.payload
    })
  }

  updateComponent(state: any) {
    return (
      <RemixUiVyperCompileDetails
        payload={this.payload}
      />
    )
  }

}
