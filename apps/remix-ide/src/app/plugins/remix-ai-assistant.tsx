import React from 'react'
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import { RemixUiRemixAiAssistant } from '@remix-ui/remix-ai-assistant'

const profile = {
  name: 'remixaiassistant',
  displayName: 'Remix AI Assistant',
  icon: 'assets/img/aiLogoHead.webp',
  description: 'AI code assistant for Remix IDE',
  kind: 'remixaiassistant',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/run.html',
  version: packageJson.version,
  maintainedBy: 'Remix',
  permission: true,
  events: [],
  methods: []
}

export class RemixAIAssistant extends ViewPlugin {
  element: HTMLDivElement
  dispatch: React.Dispatch<any> = () => {}
  constructor() {
    super(profile)
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'remix-ai-assistant')
  }

  onActivation() {

  }

  onDeactivation() {

  }

  async makePluginCall(pluginName: string, methodName: string, payload: any) {
    // const result = await this.call(pluginName, methodName, payload)
    // return result
    alert(`makePluginCall: ${pluginName} ${methodName} ${JSON.stringify(payload)}`)
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  renderComponent() {
    this.dispatch({
      ...this
    })
  }

  render() {
    return (
      <div id="remix-ai-assistant">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  updateComponent(state: any) {
    return (
      <RemixUiRemixAiAssistant plugin={this} makePluginCall={this.makePluginCall} />
    )
  }

}