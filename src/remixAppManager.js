import { AppManagerApi, Plugin } from 'remix-plugin'
import { EventEmitter } from 'events'
import PluginManagerProxy from './app/components/plugin-manager-proxy'

export class RemixAppManager extends AppManagerApi {

  constructor (store) {
    super(null)
    this.store = store
    this.hiddenServices = {}
    this.event = new EventEmitter()
    this.data = {
      proxy: new PluginManagerProxy()
    }
  }

  proxy () {
    // that's temporary. should be removed when we can have proper notification registration
    return this.data.proxy
  }

  setActive (name, isActive) {
    const entity = this.getEntity(name)
    // temp
    if (entity && name === 'solidity') {
      isActive ? this.data.proxy.register(entity.api) : this.data.proxy.unregister(entity.api)
    }
    isActive ? this.store.activate(name) : this.store.deactivate(name)
    if (!isActive) {
      this.removeHiddenServices(entity)
    }
  }

  getEntity (entityName) {
    return this.store.getOne(entityName)
  }

  addEntity (entity) {
    this.store.add(entity.profile.name, entity)
  }

  // this function is only used for iframe plugins
  resolveLocation (profile, domEl) {
    if (profile.icon) {
      this.event.emit('pluginNeedsLocation', profile, domEl)
    } else {
      this.hiddenServices[profile.name] = domEl
      document.body.appendChild(domEl)
    }
  }

  removeHiddenServices (profile) {
    let hiddenServices = this.hiddenServices[profile.name]
    if (hiddenServices) document.body.removeChild(hiddenServices)
  }

  plugins () {
    let vyper = {
      name: 'vyper',
      events: [],
      methods: [],
      notifications: {},
      url: 'https://plugin.vyper.live',
      description: 'compile vyper contracts',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMjYyIDEwNzVxLTM3IDEyMS0xMzggMTk1dC0yMjggNzQtMjI4LTc0LTEzOC0xOTVxLTgtMjUgNC00OC41dDM4LTMxLjVxMjUtOCA0OC41IDR0MzEuNSAzOHEyNSA4MCA5Mi41IDEyOS41dDE1MS41IDQ5LjUgMTUxLjUtNDkuNSA5Mi41LTEyOS41cTgtMjYgMzItMzh0NDktNCAzNyAzMS41IDQgNDguNXptLTQ5NC00MzVxMCA1My0zNy41IDkwLjV0LTkwLjUgMzcuNS05MC41LTM3LjUtMzcuNS05MC41IDM3LjUtOTAuNSA5MC41LTM3LjUgOTAuNSAzNy41IDM3LjUgOTAuNXptNTEyIDBxMCA1My0zNy41IDkwLjV0LTkwLjUgMzcuNS05MC41LTM3LjUtMzcuNS05MC41IDM3LjUtOTAuNSA5MC41LTM3LjUgOTAuNSAzNy41IDM3LjUgOTAuNXptMjU2IDI1NnEwLTEzMC01MS0yNDguNXQtMTM2LjUtMjA0LTIwNC0xMzYuNS0yNDguNS01MS0yNDguNSA1MS0yMDQgMTM2LjUtMTM2LjUgMjA0LTUxIDI0OC41IDUxIDI0OC41IDEzNi41IDIwNCAyMDQgMTM2LjUgMjQ4LjUgNTEgMjQ4LjUtNTEgMjA0LTEzNi41IDEzNi41LTIwNCA1MS0yNDguNXptMTI4IDBxMCAyMDktMTAzIDM4NS41dC0yNzkuNSAyNzkuNS0zODUuNSAxMDMtMzg1LjUtMTAzLTI3OS41LTI3OS41LTEwMy0zODUuNSAxMDMtMzg1LjUgMjc5LjUtMjc5LjUgMzg1LjUtMTAzIDM4NS41IDEwMyAyNzkuNSAyNzkuNSAxMDMgMzg1LjV6Ii8+PC9zdmc+'
    }
    let ethDoc = {
      name: 'eth doc',
      events: ['newDoc'],
      methods: ['getdoc'],
      notifications: {
        'solCompiler': ['getCompilationFinished']
      },
      url: 'https://ipfs.io/ipfs/QmbxaFhAzSYbQ4TNQhCQqBgW3dFMt7Zj1D2achHHYvJhkz/',
      description: 'generate solidity documentation'
    }
    var pipeline = {
      name: 'pipeline',
      events: [],
      methods: [],
      notifications: {},
      url: 'https://pipeline.pipeos.one',
      description: ' - ',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDxnIGNsYXNzPSJsYXllciI+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgZmlsbD0iI2ZmZmZmZiIgaWQ9InN2Z18yMyIgcj0iMjU2IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1kYXNoYXJyYXk9Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjAiLz4KICA8bGluZSBmaWxsPSJub25lIiBmaWxsLW9wYWNpdHk9IjAiIGlkPSJzdmdfMTUiIG1hcmtlci1lbmQ9InVybCgjc2VfbWFya2VyX2VuZF9zdmdfMTUpIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1kYXNoYXJyYXk9Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEyIiB4MT0iMjU2IiB4Mj0iMjU2IiB5MT0iMTg1LjAzODUyIiB5Mj0iMjg0LjAwMTEiLz4KICA8ZyBpZD0ic3ZnXzIwIj4KICAgPHJlY3QgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwIiBoZWlnaHQ9Ijk2LjY1NDA4IiBpZD0ic3ZnXzEiIHJ4PSIyMCIgcnk9IjIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMjMiIHdpZHRoPSIyODkuOTYyMjMiIHg9IjExMS4wMTg4OSIgeT0iNzAuOTA3NDQiLz4KICAgPHJlY3QgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwIiBoZWlnaHQ9Ijk2LjY1NDA4IiBpZD0ic3ZnXzQiIHJ4PSIyMCIgcnk9IjIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMjMiIHdpZHRoPSIyODkuOTYyMjMiIHg9IjExMS4wMTg4OSIgeT0iMzQ0LjQzODQ3Ii8+CiAgIDxlbGxpcHNlIGN4PSIyNTYuMDAwMDEiIGN5PSIxNjUuNzcxNjMiIGZpbGw9IiNmZmZmZmYiIGlkPSJzdmdfMTEiIHJ4PSIyMS42ODMyNCIgcnk9IjIxLjY4MzI0IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1kYXNoYXJyYXk9Im51bGwiIHN0cm9rZS1saW5lY2FwPSJudWxsIiBzdHJva2UtbGluZWpvaW49Im51bGwiIHN0cm9rZS13aWR0aD0iMjMiLz4KICAgPGVsbGlwc2UgY3g9IjI1Ni4wMDAwMSIgY3k9IjM0My4zMDMxNyIgZmlsbD0iI2ZmZmZmZiIgaWQ9InN2Z18xMiIgcng9IjIxLjY4MzI0IiByeT0iMjEuNjgzMjQiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWRhc2hhcnJheT0ibnVsbCIgc3Ryb2tlLWxpbmVjYXA9Im51bGwiIHN0cm9rZS1saW5lam9pbj0ibnVsbCIgc3Ryb2tlLXdpZHRoPSIyMyIvPgogIDwvZz4KIDwvZz4KIDxkZWZzPgogIDxtYXJrZXIgaWQ9InNlX21hcmtlcl9lbmRfc3ZnXzE1IiBtYXJrZXJIZWlnaHQ9IjUiIG1hcmtlclVuaXRzPSJzdHJva2VXaWR0aCIgbWFya2VyV2lkdGg9IjUiIG9yaWVudD0iYXV0byIgcmVmWD0iNTAiIHJlZlk9IjUwIiBzZV90eXBlPSJyaWdodGFycm93IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+CiAgIDxwYXRoIGQ9Im0xMDAsNTBsLTEwMCw0MGwzMCwtNDBsLTMwLC00MHoiIGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxMCIvPgogIDwvbWFya2VyPgogPC9kZWZzPgo8L3N2Zz4=',
      prefferedLocation: 'mainPanel'
    }
    return [{ profile: ethDoc, api: new Plugin(ethDoc, { resolveLocaton: (iframe) => { return this.resolveLocation(ethDoc, iframe) } }) },
            { profile: pipeline, api: new Plugin(pipeline, { resolveLocaton: (iframe) => { return this.resolveLocation(pipeline, iframe) } }) },
            { profile: vyper, api: new Plugin(vyper, { resolveLocaton: (iframe) => { return this.resolveLocation(vyper, iframe) } }) }]
  }
}
