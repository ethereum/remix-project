/* global localStorage, fetch */
import { PluginEngine, IframePlugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { PermissionHandler } from './app/ui/persmission-handler'

const requiredModules = [ // services + layout views + system views
  'compilerArtefacts', 'compilerMetadata', 'contextualListener', 'editor', 'offsetToLineColumnConverter', 'network', 'theme', 'fileManager', 'contentImport',
  'mainPanel', 'hiddenPanel', 'sidePanel', 'menuicons', 'fileExplorers',
  'terminal', 'settings', 'pluginManager']

const settings = {
  permissionHandler: new PermissionHandler(),
  autoActivate: false,
  natives: ['vyper', 'workshops', 'ethdoc', 'etherscan'] // Force iframe plugin to be seen as native
}

export class RemixAppManager extends PluginEngine {

  constructor (plugins) {
    super(plugins, settings)
    this.event = new EventEmitter()
    this.donotAutoReload = ['remixd'] // that would be a bad practice to force loading some plugins at page load.
    this.registered = {}
    this.pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/profile.json'
  }

  onActivated (plugin) {
    if (!this.donotAutoReload.includes(plugin.name)) {
      localStorage.setItem('workspace', JSON.stringify(this.actives))
    }
    this.event.emit('activate', plugin.name)
  }

  getAll () {
    return Object.keys(this.registered).map((p) => {
      return this.registered[p]
    })
  }

  getOne (name) {
    return this.registered[name]
  }

  getIds () {
    return Object.keys(this.registered)
  }

  onDeactivated (plugin) {
    localStorage.setItem('workspace', JSON.stringify(this.actives))
    this.event.emit('deactivate', plugin.name)
  }

  onRegistration (plugin) {
    if (!this.registered) this.registered = {}
    this.registered[plugin.name] = plugin
    this.event.emit('added', plugin.name)
  }

  // TODO check whether this can be removed
  ensureActivated (apiName) {
    if (!this.isActive(apiName)) this.activateOne(apiName)
    this.event.emit('ensureActivated', apiName)
  }

  // TODO check whether this can be removed
  ensureDeactivated (apiName) {
    if (this.isActive(apiName)) this.deactivateOne(apiName)
    this.event.emit('ensureDeactivated', apiName)
  }

  deactivateOne (name) {
    if (requiredModules.includes(name)) return
    super.deactivateOne(name)
  }

  isRequired (name) {
    return requiredModules.includes(name)
  }

  async registeredPlugins () {
    const pipeline = {
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
    const provable = {
      name: 'provable',
      displayName: 'Provable - oracle service',
      events: [],
      methods: [],
      notifications: {
        'udapp': ['newTransaction'],
        'network': ['providerChanged']
      },
      url: 'https://remix-plugin.provable.xyz',
      documentation: 'https://docs.oraclize.it/#development-tools-remix-ide-provable-plugin',
      description: 'request real-world data for your contracts',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTcuNTMgMTU5Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6bm9uZTtzdHJva2U6I2IzYjNiMztzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6OHB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+bG9nby1vdXRibGFjay1pbm5lcmdyYXk8L3RpdGxlPjxnIGlkPSJmZzEiPjxwYXRoIGQ9Ik0xNjkuMjksNjZDMTU5LjM3LDQ1LjQ5LDE0MiwyOS4xMywxMTkuNzYsMjMuMTVBNzkuMDgsNzkuMDgsMCwwLDAsNDgsMzkuNTVjLTMuNjgsMy4xMywxLjY1LDguNDIsNS4zLDUuMzFhNzEuMjYsNzEuMjYsMCwwLDEsNjUuNzgtMTQuMTFjMTkuOTIsNS43NywzNC44MywyMC42Niw0My43MiwzOSwyLjEsNC4zNSw4LjU3LjU1LDYuNDgtMy43OFoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMS42NSAtMjAuNDgpIi8+PHBhdGggZD0iTTEyNiwxNzAuNDJjMTUuNzQtNi4xOSwyOS41Ny0xNi4zMSwzOC42OC0zMC43NCw5LjY5LTE1LjMyLDEzLjA3LTM0LjE0LDEwLjc5LTUyLS42LTQuNzItOC4xMS00Ljc4LTcuNSwwLDIuMDcsMTYuMjEtLjU0LDMzLTkuMDgsNDcuMTEtOCwxMy4yMS0yMC42MSwyMi43OC0zNC44OCwyOC40LTQuNDQsMS43NC0yLjUxLDksMiw3LjIzWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIxLjY1IC0yMC40OCkiLz48cGF0aCBkPSJNMzQuMDgsNTUuNThjLTE1Ljc5LDI1LjQxLTE3LDU3LjQ0LTEsODMuMThBNzguMiw3OC4yLDAsMCwwLDEwMiwxNzUuNDFjNC44MS0uMTYsNC44NC03LjY2LDAtNy41LTI1LjE0LjgtNDkuMTItMTEuNDMtNjIuNDYtMzIuOTMtMTQuNjEtMjMuNTQtMTMuNDMtNTIuMzksMS03NS42MSwyLjU2LTQuMTEtMy45My03Ljg4LTYuNDctMy43OVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMS42NSAtMjAuNDgpIi8+PHBhdGggZD0iTTk4Ljg0LDQwLjg2YTU4LDU4LDAsMCwwLTQ5LDI3Ljc4Yy0xMi4xNiwyMC0xMC44NCw0My44OSwzLjM2LDYyLjQ1LDIuODksMy43OCw5LjQxLDAsNi40OC0zLjc5LTYuNTMtOC41Mi0xMS4yMS0xOC40OC0xMS0yOS40MkE1Mi4xMSw1Mi4xMSwwLDAsMSw1Ni4zLDcyLjQyLDUwLjI4LDUwLjI4LDAsMCwxLDk4Ljg0LDQ4LjM2YzQuODMtLjA2LDQuODQtNy41NiwwLTcuNVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMS42NSAtMjAuNDgpIi8+PHBhdGggZD0iTTcxLjIyLDE0OC4wNWMyMSwxMi4wOSw0OC4zMyw4LjQyLDY2LjIxLTcuODFBNTcuMjksNTcuMjksMCwwLDAsMTI0LjUsNDYuNzdjLTQuMjktMi4xOS04LjA5LDQuMjctMy43OSw2LjQ4LDI0LjYzLDEyLjYzLDM1LjM3LDQzLjMxLDIyLDY4LjEtMTIuOCwyMy44My00NCwzMy44Ni02Ny43NSwyMC4yMy00LjItMi40MS04LDQuMDctMy43OSw2LjQ3WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIxLjY1IC0yMC40OCkiLz48Y2lyY2xlIGNsYXNzPSJjbHMtMSIgY3g9Ijc3LjE5IiBjeT0iNzcuNDgiIHI9IjMzIi8+PGNpcmNsZSBjeD0iMjkuNTQiIGN5PSIyMS43NSIgcj0iNy43NSIvPjxjaXJjbGUgY3g9IjgwLjU0IiBjeT0iMTUxLjI1IiByPSI3Ljc1Ii8+PGNpcmNsZSBjeD0iMTQ5Ljc4IiBjeT0iNjcuMjUiIHI9IjcuNzUiLz48Y2lyY2xlIGN4PSIxMDAuNzkiIGN5PSIyOS41IiByPSI3Ljc1Ii8+PGNpcmNsZSBjeD0iMzQuNzkiIGN5PSIxMTAuNSIgcj0iNy43NSIvPjwvZz48L3N2Zz4=',
      location: 'sidePanel'
    }
    const threeBox = {
      name: 'box',
      displayName: '3Box Spaces',
      description: 'A decentralized storage for everything that happen on Remix',
      methods: ['login', 'isEnabled', 'getUserAddress', 'openSpace', 'closeSpace', 'isSpaceOpened', 'getSpacePrivateValue', 'setSpacePrivateValue', 'getSpacePublicValue', 'setSpacePublicValue', 'getSpacePublicData'],
      events: [],
      version: '0.1.0-beta',
      url: 'https://remix-3box.surge.sh',
      icon: 'https://raw.githubusercontent.com/3box/3box-dapp/master/public/3Box3.png',
      location: 'sidePanel'
    }
    const debugPlugin = {
      name: 'debugPlugin',
      displayName: 'Debug Tools for Remix plugins',
      description: 'Easily test and debug your plugins !',
      methods: ['sayHello', 'sayMyName', 'sayOurNames'], // test calls with 0, 1, and 2 args
      events: [],
      version: '0.1.0-alpha',
      url: 'https://remix-debug-a.surge.sh',
      icon: 'https://remix-debug-a.surge.sh/icon.png',
      location: 'sidePanel'
    }
    const libraTools = {
      name: 'libratools',
      displayName: 'Libra and Move Tools',
      events: [],
      methods: [],
      url: 'https://libra.pipeos.one',
      description: 'Create, compile, deploy and interact with Libra modules and scripts',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMTAyNCIKICAgaGVpZ2h0PSIxMDI0IgogICB2aWV3Qm94PSIwIDAgMjcwLjkzMzMzIDI3MC45MzMzMyIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOCIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yIDVjM2U4MGQsIDIwMTctMDgtMDYiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImxpYnJhLnN2ZyI+CiAgPGRlZnMKICAgICBpZD0iZGVmczIiIC8+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJiYXNlIgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgICBib3JkZXJvcGFjaXR5PSIxLjAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnpvb209IjAuNzczNDM3NSIKICAgICBpbmtzY2FwZTpjeD0iNTEyIgogICAgIGlua3NjYXBlOmN5PSI1MTIiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9InB4IgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9ImxheWVyMSIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgdW5pdHM9InB4IgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTY1MiIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDA1IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtMjYuMDY2NzEpIj4KICAgIDxnCiAgICAgICBpZD0iZzk3MCIKICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuODQzMTI1MjMsMCwwLDAuODQzMTI1MjMsMjEuMjUxMzAxLDI1LjM0MDUxMykiPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzc2MiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIGlkPSJwYXRoOTQ3IgogICAgICAgICBkPSJtIDQwLjc4NjQ0MywxMDcuNzM2MTcgYyAwLDAgMTkuMzI4MzA0LC0zNi44NDk4MzEgNDguOTMwMzg1LC0zNi44NDk4MzEgMjkuNjAyMDgyLDAgNjIuODI4ODkyLDI5LjYwMjA3MSA5Mi40MzA5ODIsMjkuNjAyMDcxIDI5LjYwMjA4LDAgNDcuNzI1NzksLTM4LjY2MzkzNSA0Ny43MjU3OSwtMzguNjYzOTM1IgogICAgICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MjcuNDg3NjQyMjk7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIgLz4KICAgICAgPHBhdGgKICAgICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjI3LjQ4NzY0MjI5O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGQ9Im0gNDAuNzg2NDQzLDE4NC4xNTc4NSBjIDAsMCAxOS4zMjgzMDQsLTM2Ljg0OTgyIDQ4LjkzMDM4NywtMzYuODQ5ODIgMjkuNjAyMDgsMCA2Mi44Mjg5LDI5LjYwMjA3IDkyLjQzMDk4LDI5LjYwMjA3IDI5LjYwMjA4LDAgNDcuNzI1NzksLTM4LjY2Mzk0IDQ3LjcyNTc5LC0zOC42NjM5NCIKICAgICAgICAgaWQ9InVzZTk1MSIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgc29kaXBvZGk6bm9kZXR5cGVzPSJjc3NjIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNzc2MiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIGlkPSJ1c2U5NTUiCiAgICAgICAgIGQ9Im0gNDAuNzg2NDQzLDI2MC41Nzk1NSBjIDAsMCAxOS4zMjgzMDYsLTM2Ljg0OTgzIDQ4LjkzMDM4NywtMzYuODQ5ODMgMjkuNjAyMDgsMCA2Mi44Mjg5LDI5LjYwMjA3IDkyLjQzMDk4LDI5LjYwMjA3IDI5LjYwMjA4LDAgNDcuNzI1NzksLTM4LjY2MzkzIDQ3LjcyNTc5LC0zOC42NjM5MyIKICAgICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjI3LjQ4NzY0MjI5O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K',
      location: 'sidePanel'
    }
    const oneClickDapp = {
      name: 'oneClickDapp',
      displayName: 'One Click Dapp',
      events: [],
      methods: [],
      version: '0.1.0',
      notifications: {
        solidity: ['compilationFinished']
      },
      url: 'https://remix-one-click-dapp.surge.sh',
      description: 'A free tool to generate smart contract interfaces.',
      documentation: 'https://github.com/pi0neerpat/remix-plugin-one-click-dapp',
      icon: 'https://remix-one-click-dapp.surge.sh/icon.png',
      location: 'sidePanel'
    }
    const gasProfiler = {
      name: 'gasProfiler',
      displayName: 'Gas Profiler',
      events: [],
      methods: [],
      version: '0.1.0-alpha',
      url: 'https://remix-gas-profiler.surge.sh',
      description: 'Profile gas costs',
      icon: 'https://res.cloudinary.com/key-solutions/image/upload/v1565781702/gas-profiler_nxmsal.png',
      location: 'sidePanel'
    }
    const flattener = {
      name: 'flattener',
      displayName: 'Flattener',
      events: [],
      methods: [],
      version: '0.1.0',
      url: 'https://remix-flattener.netlify.com',
      description: 'Flattens compiled smart contracts',
      documentation: 'https://github.com/Destiner/remix-flattener',
      icon: 'https://remix-flattener.netlify.com/logo.svg',
      location: 'sidePanel'
    }
    const ethpm = {
      name: 'ethPM',
      displayName: 'ethPM',
      events: [],
      methods: [],
      notifications: {
        solidity: ['compilationFinished']
      },
      url: 'https://ethpm.surge.sh',
      description: 'Generate and import ethPM packages.',
      documentation: 'https://docs.ethpm.com/ethpm-developer-guide/ethpm-and-remix-ide',
      icon: 'https://ethpm.surge.sh/ethpmlogo.png',
      location: 'mainPanel'
    }
    const zokrates = {
      name: 'ZoKrates',
      displayName: 'ZoKrates',
      description: 'ZoKrates toolbox for zkSNARKs on Ethereum',
      documentation: 'https://zokrates.github.io/',
      methods: [],
      events: [],
      version: '0.1.0-alpha',
      url: 'https://zokrates.blockchain-it.hr/',
      icon: 'https://zokrates.blockchain-it.hr/zokrates.svg',
      location: 'sidePanel'
    }
    const quorum = {
      name: 'quorum',
      displayName: 'Quorum Network',
      description: 'Deploy and interact with private contracts on a Quorum network.',
      events: [],
      methods: [],
      url: 'https://jpmorganchase.github.io/qr/',
      icon: 'https://jpmorganchase.github.io/qr/tab_icon.png',
      documentation: 'https://docs.goquorum.com/',
      version: '0.1.0-beta',
      location: 'sidePanel'
    }
    const res = await fetch(this.pluginsDirectory)
    const plugins = await res.json()
    return [
      new IframePlugin(pipeline),
      new IframePlugin(provable),
      new IframePlugin(threeBox),
      new IframePlugin(debugPlugin),
      new IframePlugin(libraTools),
      new IframePlugin(oneClickDapp),
      new IframePlugin(gasProfiler),
      new IframePlugin(flattener),
      new IframePlugin(ethpm),
      new IframePlugin(zokrates),
      new IframePlugin(quorum),
      ...plugins.map(plugin => new IframePlugin(plugin))
    ]
  }
}
