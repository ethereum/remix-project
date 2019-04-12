import { AppManagerApi, Plugin } from 'remix-plugin'
import { EventEmitter } from 'events'
import PluginManagerProxy from './app/components/plugin-manager-proxy'
import { PermissionHandler } from './persmission-handler'

export class RemixAppManager extends AppManagerApi {

  constructor (store) {
    super(null)
    this.permissionHandler = new PermissionHandler()
    this.store = store
    this.hiddenServices = {}
    this.event = new EventEmitter()
    this.data = {
      proxy: new PluginManagerProxy()
    }
  }

  ensureActivated (apiName) {
    if (!this.store.isActive(apiName)) this.activateOne(apiName)
    this.event.emit('ensureActivated', apiName)
  }

  ensureDeactivated (apiName) {
    if (this.store.isActive(apiName)) this.deactivateOne(apiName)
    this.event.emit('ensureDeactivated', apiName)
  }

  proxy () {
    // that's temporary. should be removed when we can have proper notification registration
    return this.data.proxy
  }

  setActive (name, isActive) {
    const api = this.getEntity(name)
    // temp
    if (api && (name === 'solidity' || name === 'vyper')) {
      isActive ? this.data.proxy.register(name, api) : this.data.proxy.unregister(name, api)
    }
    isActive ? this.store.activate(name) : this.store.deactivate(name)
    if (!isActive) {
      this.removeHiddenServices(api)
    }
  }

  getEntity (apiName) {
    return this.store.getOne(apiName)
  }

  addEntity (api) {
    this.store.add(api)
  }

  removeHiddenServices (profile) {
    let hiddenServices = this.hiddenServices[profile.name]
    if (hiddenServices) document.body.removeChild(hiddenServices)
  }

  plugins () {
    let vyper = {
      name: 'vyper',
      displayName: 'Vyper',
      events: ['compilationFinished'],
      methods: [],
      notifications: {},
      url: 'https://remix-vyper.surge.sh/',
      description: 'compile vyper contracts',
      kind: 'compile',
      icon: 'data:image/svg+xml;base64,PHN2ZyBpZD0iRmxhdF9Mb2dvIiBkYXRhLW5hbWU9IkZsYXQgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjA0OCAxNzczLjYyIj4gIDx0aXRsZT52eXBlci1sb2dvLWZsYXQ8L3RpdGxlPiAgPHBvbHlsaW5lIHBvaW50cz0iMTAyNCA4ODYuODEgNzY4IDEzMzAuMjIgMTAyNCAxNzczLjYyIDEyODAgMTMzMC4yMiAxMDI0IDg4Ni44MSIgc3R5bGU9ImZpbGw6IzMzMyIvPiAgPHBvbHlsaW5lIHBvaW50cz0iMTI4MCA0NDMuNDEgMTAyNCA4ODYuODEgMTI4MCAxMzMwLjIyIDE1MzYgODg2LjgxIDEyODAgNDQzLjQxIiBzdHlsZT0iZmlsbDojNjY2Ii8+ICA8cG9seWxpbmUgcG9pbnRzPSI3NjggNDQzLjQxIDUxMiA4ODYuODEgNzY4IDEzMzAuMjIgMTAyNCA4ODYuODEgNzY4IDQ0My40MSIgc3R5bGU9ImZpbGw6IzY2NiIvPiAgPHBvbHlsaW5lIHBvaW50cz0iMTUzNiAwIDEyODAgNDQzLjQxIDE1MzYgODg2LjgxIDE3OTIgNDQzLjQxIDE1MzYgMCIgc3R5bGU9ImZpbGw6IzhjOGM4YyIvPiAgPHBvbHlsaW5lIHBvaW50cz0iMTE1MiAyMjEuNyA4OTYgMjIxLjcgNzY4IDQ0My40MSAxMDI0IDg4Ni44MSAxMjgwIDQ0My40MSAxMTUyIDIyMS43IiBzdHlsZT0iZmlsbDojOGM4YzhjIi8+ICA8cG9seWxpbmUgcG9pbnRzPSI1MTIgMCAyNTYgNDQzLjQxIDUxMiA4ODYuODEgNzY4IDQ0My40MSA1MTIgMCIgc3R5bGU9ImZpbGw6IzhjOGM4YyIvPiAgPHBvbHlsaW5lIHBvaW50cz0iMjA0OCAwIDE1MzYgMCAxNzkyIDQ0My40IDIwNDggMCIgc3R5bGU9ImZpbGw6I2IyYjJiMiIvPiAgPHBvbHlsaW5lIHBvaW50cz0iNTEyIDAgMCAwIDI1NiA0NDMuNCA1MTIgMCIgc3R5bGU9ImZpbGw6I2IyYjJiMiIvPjwvc3ZnPg==',
      location: 'swapPanel'
    }
    var pipeline = {
      name: 'pipeline',
      displayName: 'Pipeline',
      events: [],
      methods: [],
      notifications: {
        'solidity': ['compilationFinished']
      },
      url: 'https://pipeline-alpha.pipeos.one',
      description: 'Visual IDE for contracts and dapps',
      icon: 'data:image/png;base64,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',
      location: 'mainPanel'
    }
    return [
      new Plugin(pipeline),
      new Plugin(vyper)
    ]
  }
}
