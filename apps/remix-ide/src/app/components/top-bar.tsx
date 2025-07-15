import React from 'react'
import { RemixUiTopbar } from '@remix-ui/top-bar'
import packageJson from '../../../../../package.json'
import { EventEmitter } from 'events'
import { CustomRemixApi } from '@remix-api'
import { Plugin } from '@remixproject/engine'
import { PluginViewWrapper } from '@remix-ui/helper'

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
  htmlElement: HTMLDivElement
  events: EventEmitter

  constructor() {
    super(TopBarProfile)
  }

  onActivation(): void {

  }

  onDeactivation(): void {

  }

  renderComponent() {
    this.dispatch({
      plugins: this,
    })
  }

  updateComponent(state: any) {
    return <RemixUiTopbar />
  }

  render() {
    return (
      <div data-id="top-bar-container">
        <PluginViewWrapper useAppContext={true} plugin={this} />
      </div>
    )
  }

}
