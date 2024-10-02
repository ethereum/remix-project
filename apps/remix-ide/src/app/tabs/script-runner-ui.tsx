import { IframePlugin, IframeProfile, ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { customScriptRunnerConfig, Dependency, ProjectConfiguration, ScriptRunnerUI } from '@remix-scriptrunner' // eslint-disable-line
import { Profile } from '@remixproject/plugin-utils'
import { Engine, Plugin } from '@remixproject/engine'
import axios from 'axios'
import { AppModal } from '@remix-ui/app'
import { isArray } from 'lodash'
import { PluginViewWrapper } from '@remix-ui/helper'
import { CustomRemixApi } from '@remix-api'

const profile = {
  name: 'scriptRunnerBridge',
  displayName: 'Script configuration',
  methods: ['execute'],
  events: ['log', 'info', 'warn', 'error'],
  icon: 'assets/img/settings.webp',
  description: 'Set up a script runner',
  kind: '',
  location: 'sidePanel',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

const configFileName = 'script.config.json'

export class ScriptRunnerUIPlugin extends ViewPlugin {
  engine: Engine
  current: string
  currentTemplate: string
  dispatch: React.Dispatch<any> = () => { }
  workspaceScriptRunnerDefaults: Record<string, string>
  customConfig: customScriptRunnerConfig
  configurations: ProjectConfiguration[]
  plugin: Plugin<any, CustomRemixApi>
  constructor(engine: Engine) {
    super(profile)
    console.log('ScriptRunnerUIPlugin', this)
    this.engine = engine
    this.workspaceScriptRunnerDefaults = {}
    this.plugin = this
  }

  async onActivation() {
    console.log('onActivation', this)

    console.log('onActivation', this.customConfig)

    this.on('filePanel', 'setWorkspace', async (workspace: string) => {
      console.log('setWorkspace', workspace, this)
      this.customConfig = {
        baseConfiguration: 'default',
        dependencies: []
      }
      await this.loadCustomConfig()
      this.loadConfigurations()
      this.renderComponent()
      console.log('setWorkspace', this.customConfig)
    })

    this.plugin.on('fileManager','fileSaved', async (file: string) =>{
      console.log(file)
      if(file === configFileName) {
        await this.loadCustomConfig()
        this.renderComponent()
      }
    })

    await this.loadCustomConfig()
    this.loadConfigurations()
    this.renderComponent()
  }

  render() {
    return (
      <div id="scriptrunnerTab">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  renderComponent() {
    this.dispatch({
      customConfig: this.customConfig,
      configurations: this.configurations,
    })
  }

  updateComponent(state: any) {
    console.log('updateComponent', state)
    return (
      <ScriptRunnerUI
        customConfig={state.customConfig}
        configurations={state.configurations}
        activateCustomScriptRunner={this.activateCustomScriptRunner.bind(this)}
        saveCustomConfig={this.saveCustomConfig.bind(this)}
        openCustomConfig={this.openCustomConfig.bind(this)}
        buildScriptRunner={this.buildScriptRunner.bind(this)}
        loadScriptRunner={this.loadScriptRunner.bind(this)} />
    )
  }

  async loadScriptRunner(name: string) {
    console.log('loadScriptRunner', name)
    const profile: Profile = await this.plugin.call('manager', 'getProfile', 'scriptRunner')
    const testPluginName = localStorage.getItem('test-plugin-name')
    const testPluginUrl = localStorage.getItem('test-plugin-url')
    let baseUrl = 'http://localhost:3000'
    let url = `${baseUrl}?template=${name}&timestamp=${Date.now()}`
    if (testPluginName === 'scriptRunner') {
      // if testpluginurl has template specified only use that
      if (testPluginUrl.indexOf('template') > -1) {
        url = testPluginUrl
      } else {
        baseUrl = `//${new URL(testPluginUrl).host}`
        url = `${baseUrl}?template=${name}&timestamp=${Date.now()}`
      }
    }

    const newProfile: IframeProfile = {
      ...profile,
      name: profile.name + name,
      location: 'hidden',
      url: url
    }
    console.log('loadScriptRunner', newProfile)
    try {
      const plugin: IframePlugin = new IframePlugin(newProfile)
      await this.engine.register(plugin)
      await this.plugin.call('manager', 'activatePlugin', newProfile.name)
      this.current = newProfile.name
      this.currentTemplate = name
      this.on(newProfile.name, 'log', this.log.bind(this))
      this.on(newProfile.name, 'info', this.info.bind(this))
      this.on(newProfile.name, 'warn', this.warn.bind(this))
      this.on(newProfile.name, 'error', this.error.bind(this))
      this.on(newProfile.name, 'dependencyError', this.dependencyError.bind(this))
    } catch (e) {
      this.current = newProfile.name
      this.currentTemplate = name
      console.log('Already loaded')
    }
  }

  async execute(script: string, filePath: string) {
    if (!this.current) await this.loadScriptRunner('default')
    console.log('execute', this.current)
    await this.call(this.current, 'execute', script, filePath)
  }

  async dependencyError(data: any) {
    console.log('dependencyError', data)
    let message = `Error loading dependencies: `
    if (isArray(data.data)) {
      data.data.forEach((data: any) => {
        message += `${data}`
      })
    }

    const modal: AppModal = {
      id: 'TemplatesSelection',
      title: 'Missing dependencies',
      message: `${message} \n\n You may need to setup a script engine for this workspace to load the correct dependencies. Do you want go to setup now?`,
      okLabel: window._intl.formatMessage({ id: 'filePanel.ok' }),
      cancelLabel: 'ignore'
    }
    const modalResult = await this.plugin.call('notification' as any, 'modal', modal)
    if (modalResult) {
      await this.plugin.call('menuicons', 'select', 'scriptRunnerBridge')
    } else {

    }
  }

  async log(data: any) {
    console.log('log', data)
    this.emit('log', data)
  }

  async warn(data: any) {
    console.log('warn', data)
    this.emit('warn', data)
  }

  async error(data: any) {
    console.log('error', data)
    this.emit('error', data)
  }

  async info(data: any) {
    console.log('info', data)
    this.emit('info', data)
  }

  async buildScriptRunner(dependencies: Dependency[]) {
    console.log('buildScriptRunner', dependencies)
  }

  async loadCustomConfig(): Promise<customScriptRunnerConfig> {
    console.log('loadCustomConfig')
    //await this.plugin.call('fileManager', 'open', 'script.config.json')
    try {
      const content = await this.plugin.call('fileManager', 'readFile', configFileName)
      const parsed = JSON.parse(content)
      this.customConfig = parsed
    } catch (e) {
      return {
        baseConfiguration: 'default',
        dependencies: []
      }
    }
  }

  async openCustomConfig() {
        try {
          await this.plugin.call('fileManager', 'open', 'script.config.json')
        }catch(e){

        }
  }

  async loadConfigurations() {
    try {
      const response = await axios.get('http://localhost:3000/projects.json?timestamp=' + Date.now());
      this.configurations = response.data;
    } catch (error) {
      console.error("Error fetching the projects data:", error);
    }

  }

  async saveCustomConfig(content: customScriptRunnerConfig) {
    console.log('saveCustomConfig', content)
    await this.plugin.call('fileManager', 'writeFile', 'script.config.json', JSON.stringify(content, null, 2))
  }

  async activateCustomScriptRunner(config: customScriptRunnerConfig) {
    console.log('activateCustomScriptRunner', config)
    // post config to localhost:4000 using axios
    try {
      const result = await axios.post('http://localhost:4000/build', config)
      console.log(result)
      if (result.data.hash) {
        await this.loadScriptRunner(result.data.hash)
      }
      return result.data.hash
    } catch (error) {
      let message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);  // This should give you the output being sent
        console.log('Error headers:', error.response.headers);

        if (error.response.data.error) {

          if (isArray(error.response.data.error)) {
            const message = `${error.response.data.error[0]}`
            this.plugin.call('notification', 'alert', {
              id: 'scriptalert',
              message,
              title: 'Error'
            })
            throw new Error(message)
          }
          message = `${error.response.data.error}`
        }
        message = `Uknown error: ${error.response.data}`
        this.plugin.call('notification', 'alert', {
          id: 'scriptalert',
          message,
          title: 'Error'
        })
        throw new Error(message)
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received:', error.request);
        throw new Error('No response received')
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error message:', error.message);
        throw new Error(error.message)
      }

    }
  }


}