import { IframePlugin, IframeProfile, ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { ScriptRunnerUI } from '@remix-scriptrunner' // eslint-disable-line
import { Profile } from '@remixproject/plugin-utils'
import { Engine } from '@remixproject/engine'
const profile = {
  name: 'scriptRunnerBridge',
  displayName: 'Script Bridge',
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
    console.log('loadScriptRunner', name, this)
    const profile: IframeProfile = await this.call('manager', 'getProfile', 'scriptRunner')
    const newProfile: IframeProfile = {
      ...profile,
      name: profile.name + name,
      url: 'http://localhost:3000?template=' + name
    }
    console.log('loadScriptRunner', newProfile)
    try {
      const plugin: IframePlugin = new IframePlugin(newProfile)
      await this.engine.register(plugin)
      await this.call('manager', 'activatePlugin', newProfile.name)
      this.current = newProfile.name
      this.currentTemplate = name
      this.on(newProfile.name, 'log', this.log.bind(this))
      this.on(newProfile.name, 'info', this.log.bind(this))
      this.on(newProfile.name, 'warn', this.log.bind(this))
      this.on(newProfile.name, 'error', this.log.bind(this))
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


  render() {
    return (
      <div id="scriptRunnerTab">
        <ScriptRunnerUI loadScriptRunner={this.loadScriptRunner.bind(this)} />
      </div>
    )
  }
}