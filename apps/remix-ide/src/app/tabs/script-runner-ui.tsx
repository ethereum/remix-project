import { IframePlugin, IframeProfile, ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { customScriptRunnerConfig, ProjectConfiguration, ScriptRunnerConfig, ScriptRunnerUI } from '@remix-scriptrunner' // eslint-disable-line
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
  icon: 'assets/img/solid-gear-circle-play.svg',
  description: 'Configure the dependencies for running scripts.',
  kind: '',
  location: 'sidePanel',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

const configFileName = '.remix/script.config.json'

let baseUrl = 'https://remix-project-org.github.io/script-runner-generator'
const customBuildUrl = 'http://localhost:4000/build' // this will be used when the server is ready

interface IScriptRunnerState {
  customConfig: customScriptRunnerConfig
  configurations: ProjectConfiguration[]
  activeConfig: ProjectConfiguration
  enableCustomScriptRunner: boolean
}

export class ScriptRunnerUIPlugin extends ViewPlugin {
  engine: Engine
  dispatch: React.Dispatch<any> = () => { }
  workspaceScriptRunnerDefaults: Record<string, string>
  customConfig: ScriptRunnerConfig
  configurations: ProjectConfiguration[]
  activeConfig: ProjectConfiguration
  enableCustomScriptRunner: boolean
  plugin: Plugin<any, CustomRemixApi>
  scriptRunnerProfileName: string
  constructor(engine: Engine) {
    super(profile)
    this.engine = engine
    this.workspaceScriptRunnerDefaults = {}
    this.plugin = this
    this.enableCustomScriptRunner = false // implement this later
  }

  async onActivation() {

    this.on('filePanel', 'setWorkspace', async (workspace: string) => {
      this.activeConfig = null
      this.customConfig =
      {
        defaultConfig: 'default',
        customConfig: {
          baseConfiguration: 'default',
          dependencies: []
        }
      }
      await this.loadCustomConfig()
      await this.loadConfigurations()
      this.renderComponent()
    })

    this.plugin.on('fileManager', 'fileSaved', async (file: string) => {
      if (file === configFileName && this.enableCustomScriptRunner) {
        await this.loadCustomConfig()
        this.renderComponent()
      }
    })
    await this.loadCustomConfig()
    await this.loadConfigurations()
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
      activeConfig: this.activeConfig,
      enableCustomScriptRunner: this.enableCustomScriptRunner
    })
  }

  updateComponent(state: IScriptRunnerState) {
    return (
      <ScriptRunnerUI
        customConfig={state.customConfig}
        configurations={state.configurations}
        activeConfig={state.activeConfig}
        enableCustomScriptRunner={state.enableCustomScriptRunner}
        activateCustomScriptRunner={this.activateCustomScriptRunner.bind(this)}
        saveCustomConfig={this.saveCustomConfig.bind(this)}
        openCustomConfig={this.openCustomConfig.bind(this)}
        loadScriptRunner={this.selectScriptRunner.bind(this)}
      />
    )
  }

  async selectScriptRunner(config: ProjectConfiguration) {
    if (await this.loadScriptRunner(config))
      await this.saveCustomConfig(this.customConfig)
  }

  async loadScriptRunner(config: ProjectConfiguration): Promise<boolean> {

    const profile: Profile = await this.plugin.call('manager', 'getProfile', 'scriptRunner')
    this.scriptRunnerProfileName = profile.name
    const testPluginName = localStorage.getItem('test-plugin-name')
    const testPluginUrl = localStorage.getItem('test-plugin-url')

    let url = `${baseUrl}?template=${config.name}&timestamp=${Date.now()}`
    if (testPluginName === 'scriptRunner') {
      // if testpluginurl has template specified only use that
      if (testPluginUrl.indexOf('template') > -1) {
        url = testPluginUrl
      } else {
        baseUrl = `//${new URL(testPluginUrl).host}`
        url = `${baseUrl}?template=${config.name}&timestamp=${Date.now()}`
      }
    }
    //console.log('loadScriptRunner', profile)
    const newProfile: IframeProfile = {
      ...profile,
      name: profile.name + config.name,
      location: 'hiddenPanel',
      url: url
    }

    let result = null
    try {
      this.setIsLoading(config.name, true)
      const plugin: IframePlugin = new IframePlugin(newProfile)
      if (!this.engine.isRegistered(newProfile.name)) {

        await this.engine.register(plugin)
      }
      await this.plugin.call('manager', 'activatePlugin', newProfile.name)

      this.activeConfig = config
      this.on(newProfile.name, 'log', this.log.bind(this))
      this.on(newProfile.name, 'info', this.info.bind(this))
      this.on(newProfile.name, 'warn', this.warn.bind(this))
      this.on(newProfile.name, 'error', this.error.bind(this))
      this.on(newProfile.name, 'dependencyError', this.dependencyError.bind(this))
      this.customConfig.defaultConfig = config.name
      this.setErrorStatus(config.name, false, '')
      result = true
    } catch (e) {
      console.log('Error loading script runner: ', newProfile.name, e)
      const iframe = document.getElementById(`plugin-${newProfile.name}`);
      if (iframe) {
        await this.call('hiddenPanel', 'removeView', newProfile)
      }

      delete (this.engine as any).manager.profiles[newProfile.name]
      delete (this.engine as any).plugins[newProfile.name]
      console.log('Error loading script runner: ', newProfile.name, e)
      this.setErrorStatus(config.name, true, e)
      result = false
    }

    this.setIsLoading(config.name, false)
    this.renderComponent()
    return result
  }

  async execute(script: string, filePath: string) {
    this.call('terminal', 'log', { value: `running ${filePath} ...`, type: 'info' })
    if (!this.scriptRunnerProfileName || !this.engine.isRegistered(`${this.scriptRunnerProfileName}${this.activeConfig.name}`)) {
      if (!await this.loadScriptRunner(this.activeConfig)) {
        console.error('Error loading script runner')
        return
      }
    }
    try {
      this.setIsLoading(this.activeConfig.name, true)
      await this.call(`${this.scriptRunnerProfileName}${this.activeConfig.name}`, 'execute', script, filePath)
    } catch (e) {
      console.error('Error executing script', e)
    }
    this.setIsLoading(this.activeConfig.name, false)

  }

  async setErrorStatus(name: string, status: boolean, error: string) {
    this.configurations.forEach((config) => {
      if (config.name === name) {
        config.errorStatus = status
        config.error = error
      }
    })
    this.renderComponent()
  }

  async setIsLoading(name: string, status: boolean) {
    if (status) {
      this.emit('statusChanged', {
        key: 'loading',
        type: 'info',
        title: 'loading...'
      })
    } else {
      this.emit('statusChanged', {
        key: 'none'
      })
    }
    this.configurations.forEach((config) => {
      if (config.name === name) {
        config.isLoading = status
      }
    })
    this.renderComponent()
  }

  async dependencyError(data: any) {
    console.log('Script runner dependency error: ', data)
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
    this.emit('log', data)
  }

  async warn(data: any) {
    this.emit('warn', data)
  }

  async error(data: any) {
    this.emit('error', data)
  }

  async info(data: any) {
    this.emit('info', data)
  }

  async loadCustomConfig(): Promise<void> {
    try {
      const content = await this.plugin.call('fileManager', 'readFile', configFileName)
      const parsed = JSON.parse(content)
      this.customConfig = parsed
    } catch (e) {
      this.customConfig = {
        defaultConfig: 'default',
        customConfig: {
          baseConfiguration: 'default',
          dependencies: []
        }
      }
    }
  }

  async openCustomConfig() {
    try {
      await this.plugin.call('fileManager', 'open', '.remix/script.config.json')
    } catch (e) {

    }
  }

  async loadConfigurations() {
    try {
      const response = await axios.get(`${baseUrl}/projects.json?timestamp=${Date.now()}`);
      this.configurations = response.data;
      // find the default otherwise pick the first one as the active
      this.configurations.forEach((config) => {
        if (config.name === (this.customConfig.defaultConfig)) {
          this.activeConfig = config;
        }
      });
      if (!this.activeConfig) {
        this.activeConfig = this.configurations[0];
      }
    } catch (error) {
      console.error("Error fetching the projects data:", error);
    }

  }

  async saveCustomConfig(content: ScriptRunnerConfig) {
    if (content.customConfig.dependencies.length === 0 && content.defaultConfig === 'default') {
      try {
        const exists = await this.plugin.call('fileManager', 'exists', '.remix/script.config.json')
        if (exists) {
          await this.plugin.call('fileManager', 'remove', '.remix/script.config.json')
        }
      } catch (e) {
      }
      return
    }
    await this.plugin.call('fileManager', 'writeFile', '.remix/script.config.json', JSON.stringify(content, null, 2))
  }

  async activateCustomScriptRunner(config: customScriptRunnerConfig) {
    try {
      const result = await axios.post(customBuildUrl, config)
      if (result.data.hash) {

        const newConfig: ProjectConfiguration = {
          name: result.data.hash,
          title: 'Custom configuration',
          publish: true,
          description: `Extension of ${config.baseConfiguration}`,
          dependencies: config.dependencies,
          replacements: {},
          errorStatus: false,
          error: '',
          isLoading: false
        };
        this.configurations.push(newConfig)
        this.renderComponent()
        await this.loadScriptRunner(result.data.hash)
      }
      return result.data.hash
    } catch (error) {
      let message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data); // This should give you the output being sent
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