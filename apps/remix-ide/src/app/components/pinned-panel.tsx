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

  focus(name) {
    this.emit('focusChanged', name)
    super.focus(name)
  }

  removeView(profile) {
    super.removeView(profile)
    this.emit('unpinnedPlugin', profile.name)
    this.renderComponent()
  }

  addView(profile, view) {
    super.addView(profile, view)
    this.renderComponent()
  }

  /**
   * Display content and update the header
   * @param {String} name The name of the plugin to display
   */
  async showContent(name) {
    super.showContent(name)
    this.emit('focusChanged', name)
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
