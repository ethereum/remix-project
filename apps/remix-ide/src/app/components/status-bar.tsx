import React from 'react'
import { EventEmitter } from 'events'
import { Plugin } from '@remixproject/engine'
import packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import { PluginProfile, StatusBarInterface } from '../../types'
import { RemixUIStatusBar } from '@remix-ui/statusbar'

const statusBarProfile: PluginProfile = {
  name: 'statusBar',
  displayName: 'Status Bar',
  description: 'Remix IDE status bar panel',
  methods: ['getGitBranchName'],
  version: packageJson.version,
}

export class StatusBar extends Plugin implements StatusBarInterface {
  htmlElement: HTMLDivElement
  events: EventEmitter
  dispatch: React.Dispatch<any> = () => {}
  currentWorkspaceName: string = ''
  constructor() {
    super(statusBarProfile)
    this.events = new EventEmitter()
    this.htmlElement = document.createElement('div')
    this.htmlElement.setAttribute('id', 'status-bar')
  }

  onActivation(): void {
    this.on('filePanel', 'setWorkspace', async () => {
      await this.getGitBranchName()
    })
    this.renderComponent()
  }

  async getGitBranchName() {
    const isGitRepo = await this.call('fileManager', 'isGitRepo')
    if (!isGitRepo) return
    const repoName = await this.call('filePanel', 'getCurrentWorkspace')
    repoName && repoName?.name.length > 0 ? this.currentWorkspaceName = repoName.name : this.currentWorkspaceName = ''
    return { repoWorkspaceName: repoName }
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  renderComponent() {
    this.dispatch({
      plugins: this,
    })
  }

  updateComponent(state: any) {
    return <RemixUIStatusBar statusBarPlugin={state.plugins} />
  }

  render() {
    return (
      <div data-id="status-bar-container">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }
}
