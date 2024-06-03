import { Plugin } from "@remixproject/engine"
import { EventEmitter } from 'events'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'pluginStateLogger',
  events: [],
  methods: ['logPluginState', 'getPluginState'],
  version: packageJson.version,
}

export class PluginStateLogger extends Plugin {
  constructor() {
    super(profile)
    this.events = new EventEmitter()
    this.stateLogs = {}
  }

  logPluginState(name, state) {
    this.stateLogs[name] = state
  }

  getPluginState(name) {
    return this.stateLogs[name]
  }
}