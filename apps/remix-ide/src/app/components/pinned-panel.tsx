// eslint-disable-next-line no-use-before-define
import React from 'react'
import { AbstractPanel } from './panel'
import { RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { RemixUIPanelHeader } from '@remix-ui/panel'
import { PluginViewWrapper } from '@remix-ui/helper'

const pinnedPanel = {
  name: 'pinnedPanel',
  displayName: 'Pinned Panel',
  description: 'Remix IDE pinned panel',
  version: packageJson.version,
  methods: ['addView', 'removeView', 'currentFocus']
}

export class PinnedPanel extends AbstractPanel {
  sideelement: any
  dispatch: React.Dispatch<any> = () => {}

  constructor() {
    super(pinnedPanel)
  }

  onActivation() {
    this.renderComponent()
  }

  currentFocus (): string {
    return Object.values(this.plugins).find(plugin => {
      return plugin.pinned
    }).profile.name
  }

  removeView(profile) {
    this.remove(profile.name)
    this.emit('unpinnedPlugin', profile.name)
    this.renderComponent()
  }

  addView(profile, view) {
    super.addView(profile, view)
    this.plugins[profile.name].pinned = true
    super.showContent(profile.name)
    this.emit('pinnedPlugin', profile.name)
    this.renderComponent()
  }

  setDispatch (dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  render() {
    return (
      <section className='panel pinned-panel'> <PluginViewWrapper plugin={this} /></section>
    )
  }

  updateComponent(state: any) {
    return <RemixPluginPanel header={<RemixUIPanelHeader plugins={state.plugins}></RemixUIPanelHeader>} plugins={state.plugins} />
  }

  renderComponent() {
    this.dispatch({
      plugins: this.plugins
    })
  }
}
