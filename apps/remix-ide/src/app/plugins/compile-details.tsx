import React from 'react'
import { ViewPlugin } from '@remixproject/engine-web'
import { PluginViewWrapper } from '@remix-ui/helper'
import { RemixAppManager } from '../../remixAppManager'
import { RemixUiCompileDetails } from '@remix-ui/solidity-compile-details'

const _paq = (window._paq = window._paq || [])

type CompileDetailsPayload = {
  contractProperties: any,
  selectedContract: string,
  help: any,
  insertValue: any,
  saveAs: any,
}

interface ICompilationDetailsPlugin extends ViewPlugin {
  showDetails: (payload: any) => void
}

const profile = {
  name: 'compilationDetails',
  displayName: 'Solidity Compile Details',
  description: 'Displays details from solidity compiler',
  location: 'mainPanel',
  methods: ['showDetails', 'getTabHeadDetails'],
  events: []
}

export class CompilationDetailsPlugin extends ViewPlugin implements ICompilationDetailsPlugin {
  dispatch: React.Dispatch<any> = () => {}
  appManager: RemixAppManager
  element: HTMLDivElement
  payload: CompileDetailsPayload
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'compileDetails')
    this.payload
  }

  async onActivation() {
    _paq.push(['trackEvent', 'plugin', 'activated', 'compilationDetails'])
  }

  onDeactivation(): void {

  }

  async showDetails(sentPayload: any) {
    await this.call('tabs', 'focus', 'compilationDetails')
    setTimeout(async () => {
      this.payload = sentPayload
      this.renderComponent()
    }, 2000)
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
      <RemixUiCompileDetails
        plugin={this}
        contractProperties={state.contractProperties}
        selectedContract={state.selectedContract}
        saveAs={state.saveAs}
        help={state.help}
        insertValue={state.insertValue}
      />
    )
  }

}
