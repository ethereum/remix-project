import { IframePlugin, IframeProfile, ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { customScriptRunnerConfig, Dependency, ScriptRunnerUI } from '@remix-scriptrunner' // eslint-disable-line
import { Profile } from '@remixproject/plugin-utils'
import { Engine } from '@remixproject/engine'
import axios from 'axios'

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

export class ScriptRunnerUIPlugin extends ViewPlugin {
  engine: Engine
  current: string
  currentTemplate: string
  constructor(engine: Engine) {
    super(profile)
    console.log('ScriptRunnerUIPlugin', this)
    this.engine = engine
  }

  async onActivation() {
    console.log('onActivation', this)
  }

  async loadScriptRunner(name: string) {
    console.log('loadScriptRunner', name)
    const profile: IframeProfile = await this.call('manager', 'getProfile', 'scriptRunner')
    const testPluginName = localStorage.getItem('test-plugin-name')
    const testPluginUrl = localStorage.getItem('test-plugin-url')
    let baseUrl = 'http://localhost:3000'
    let url = `${baseUrl}?template=${name}`
    if(testPluginName === 'scriptRunner') {
      // if testpluginurl has template specified only use that
      if (testPluginUrl.indexOf('template')>-1) {
        url = testPluginUrl
      } else {
        baseUrl = `//${new URL(testPluginUrl).host}`
        url = `${baseUrl}?template=${name}&timestamp=${Date.now()}`
      }
    }

    const newProfile: IframeProfile = {
      ...profile,
      name: profile.name + name,
      url: url
    }
    console.log('loadScriptRunner', newProfile)
    try {
      const plugin: IframePlugin = new IframePlugin(newProfile)
      await this.engine.register(plugin)
      await this.call('manager', 'activatePlugin', newProfile.name)
      this.current = newProfile.name
      this.currentTemplate = name
      this.on(newProfile.name, 'log', this.log.bind(this))
      this.on(newProfile.name, 'info', this.info.bind(this))
      this.on(newProfile.name, 'warn', this.warn.bind(this))
      this.on(newProfile.name, 'error', this.error.bind(this))
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

  async loadCustomConfig(){
    console.log('loadCustomConfig')
    await this.call('fileManager', 'open', 'script.config.json')
    const content = await this.call('fileManager', 'readFile', 'script.config.json')
    return JSON.parse(content)
  }

  async saveCustomConfig(content: customScriptRunnerConfig){
    console.log('saveCustomConfig', content)
    await this.call('fileManager', 'writeFile', 'script.config.json', JSON.stringify(content, null, 2))
  }

  async activateCustomScriptRunner(config: customScriptRunnerConfig){
    console.log('activateCustomScriptRunner', config)
    // post config to localhost:4000 using axios
    const result = await axios.post('http://localhost:4000/build', config)
    console.log(result)
    if(result.data.hash) {
      await this.loadScriptRunner(result.data.hash)
    }
    return result.data.hash
  }

  render() {
    return (
      <div id="scriptRunnerTab">
        <ScriptRunnerUI 
        activateCustomScriptRunner={this.activateCustomScriptRunner.bind(this)}
        saveCustomConfig={this.saveCustomConfig.bind(this)} 
        loadCustomConfig={this.loadCustomConfig.bind(this)} 
        buildScriptRunner={this.buildScriptRunner.bind(this)} 
        loadScriptRunner={this.loadScriptRunner.bind(this)} />
      </div>
    )
  }
}