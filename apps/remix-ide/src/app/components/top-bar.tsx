/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React from 'react'
import { TopbarProvider } from '@remix-ui/top-bar'
import packageJson from '../../../../../package.json'
import { EventEmitter } from 'events'
import { Plugin } from '@remixproject/engine'
import { PluginViewWrapper } from '@remix-ui/helper'
import { AppAction } from 'libs/remix-ui/app/src/lib/remix-app/actions/app'
import FilePanel from '../panels/file-panel'
import { WorkspaceMetadata } from 'libs/remix-ui/workspace/src/lib/types'
import { gitUIPanels } from '@remix-ui/git'
import { HOME_TAB_NEW_UPDATES } from 'libs/remix-ui/home-tab/src/lib/components/constant'
import axios from 'axios'
import { UpdateInfo } from 'libs/remix-ui/home-tab/src/lib/components/types/carouselTypes'
import { loginWithGitHub } from 'libs/remix-ui/git/src/lib/pluginActions'

const TopBarProfile = {
  name: 'topbar',
  displayName: 'Top Bar',
  description: '',
  version: packageJson.version,
  icon: '',
  methods: [],
  events: []
}

export class Topbar extends Plugin {
  dispatch: React.Dispatch<any> = () => { }
  appStateDispatch: React.Dispatch<AppAction> = () => { }
  htmlElement: HTMLDivElement
  events: EventEmitter
  topbarExpandPath: string
  filePanel: FilePanel
  workspaces: WorkspaceMetadata[]
  currentWorkspaceMetadata: WorkspaceMetadata

  constructor(filePanel: FilePanel) {
    super(TopBarProfile)
    this.filePanel = filePanel
    this.workspaces = []
    this.currentWorkspaceMetadata = null
  }

  onActivation(): void {
    this.renderComponent()
  }

  onDeactivation(): void {

  }

  async getWorkspaces() {
    while (this.workspaces.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
      this.workspaces = await this.call('filePanel', 'getWorkspaces')
    }
    return this.workspaces
  }

  async getCurrentWorkspaceMetadata() {
    while (!this.currentWorkspaceMetadata) {
      await new Promise(resolve => setTimeout(resolve, 100))
      this.currentWorkspaceMetadata = await this.call('filePanel', 'getCurrentWorkspace')
    }
  }

  async logInGithub () {
    await this.call('menuicons', 'select', 'dgit')
    await this.call('dgit', 'open', gitUIPanels.GITHUB)
  }

  async getLatestUpdates() {
    try {
      const response = await axios.get(HOME_TAB_NEW_UPDATES)
      return response.data
    } catch (error) {
      console.error('Error fetching plugin list:', error)
    }
  }

  async getLatestReleaseNotesUrl () {
    const response = await this.getLatestUpdates()
    const data: UpdateInfo[] = response
    const interim = data.find(x => x.action.label.includes('Release notes'))
    const targetUrl = interim.action.url
    const currentReleaseVersion = interim.badge.split(' ')[0]
    return [targetUrl, currentReleaseVersion]
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  setAppStateDispatch(appStateDispatch: React.Dispatch<AppAction>) {
    this.appStateDispatch = appStateDispatch
  }

  renderComponent() {
    this.dispatch({
      plugins: this,
    })
  }

  updateComponent(state: any) {
    return <TopbarProvider plugin={this} />
  }

  render() {
    return (
      <div data-id="top-bar-container">
        <PluginViewWrapper useAppContext={true} plugin={this} />
      </div>
    )
  }

}
