import { IframePlugin, IframeProfile, ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { customScriptRunnerConfig, IScriptRunnerState, ProjectConfiguration, ScriptRunnerConfig, ScriptRunnerUI } from '@remix-scriptrunner'
import { Profile } from '@remixproject/plugin-utils'
import { Engine, Plugin } from '@remixproject/engine'
import axios from 'axios'
import { AppModal } from '@remix-ui/app'
import { isArray } from 'lodash'
import { PluginViewWrapper } from '@remix-ui/helper'
import { CustomRemixApi } from '@remix-api'
import { ScriptRunnerBridgePlugin } from '../plugins/script-runner-bridge'

const profile = {
  name: 'UIScriptRunner',
  displayName: 'Script configuration',
  methods: [],
  events: [],
  icon: 'assets/img/solid-gear-circle-play.svg',
  description: 'Configure the dependencies for running scripts.',
  kind: '',
  location: 'mainPanel',
  version: packageJson.version,
  maintainedBy: 'Remix',
}

export class ScriptRunnerUIPlugin extends ViewPlugin {
  dispatch: React.Dispatch<IScriptRunnerState> = () => {}
  state: IScriptRunnerState
  bridge: ScriptRunnerBridgePlugin
  constructor(plugin: ScriptRunnerBridgePlugin) {
    super(profile)
    this.bridge = plugin
  }

  async onActivation() {
    this.on('scriptRunnerBridge', 'render', () => {
      this.renderComponent()
    })	
    this.renderComponent()
  }

  render() {
    return (
      <div id="scriptrunnerTab">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  setDispatch(dispatch: React.Dispatch<IScriptRunnerState>) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  renderComponent() {
    this.dispatch({
      customConfig: this.bridge.customConfig.customConfig,
      configurations: this.bridge.configurations,
      activeConfig: this.bridge.activeConfig,
      enableCustomScriptRunner: this.bridge.enableCustomScriptRunner,
    })
  }

  async activateCustomScriptRunner(config: customScriptRunnerConfig) {
    this.bridge.activateCustomScriptRunner(config)
  }

  async saveCustomConfig(content: ScriptRunnerConfig) {
    this.bridge.saveCustomConfig(content)
  }

  async openCustomConfig() {
    this.bridge.openCustomConfig()
  }

  async selectScriptRunner(config: ProjectConfiguration) {
    this.bridge.selectScriptRunner(config)
  }

  updateComponent(state: IScriptRunnerState) {
    return <ScriptRunnerUI customConfig={state.customConfig} configurations={state.configurations} activeConfig={state.activeConfig} enableCustomScriptRunner={state.enableCustomScriptRunner} activateCustomScriptRunner={this.activateCustomScriptRunner.bind(this)} saveCustomConfig={this.saveCustomConfig.bind(this)} openCustomConfig={this.openCustomConfig.bind(this)} loadScriptRunner={this.selectScriptRunner.bind(this)} />
  }
}
