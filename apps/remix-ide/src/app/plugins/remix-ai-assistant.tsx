import React from 'react'
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import { RemixUiRemixAiAssistant } from '@remix-ui/remix-ai-assistant'
import { EventEmitter } from 'events'
const profile = {
  name: 'remixaiassistant',
  displayName: 'Remix AI Assistant',
  icon: 'assets/img/remixai-logoDefault.webp',
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
  event: any
  constructor() {
    super(profile)
    this.event = new EventEmitter()
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'remix-ai-assistant')
  }

  async onActivation() {
    const currentActivePlugin = await this.call('pinnedPanel', 'currentFocus')
    if (currentActivePlugin === 'remixaiassistant') {
      await this.call('sidePanel', 'pinView', profile)
      await this.call('layout', 'maximiseSidePanel')
    }
  }

  onDeactivation() {

  }

  async makePluginCall (pluginName: string, methodName: string, payload: any) {
    try {
      const result = await this.call(pluginName, methodName, payload)
      return result
    } catch (error) {
      if (pluginName === 'fileManager' && methodName === 'getCurrentFile') {
        await this.call('notification', 'alert', 'No file is open')
        return null
      }
      console.error(error)
      return null
    }
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
      <div id="remix-ai-assistant"
        data-id="remix-ai-assistant">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  updateComponent(state: any) {
    return (
      <RemixUiRemixAiAssistant plugin={this} makePluginCall={this.makePluginCall.bind(this)} />
    )
  }

}