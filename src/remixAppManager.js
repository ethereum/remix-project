import { AppManagerApi, Plugin } from 'remix-plugin'
import { EventEmitter } from 'events'
import PluginManagerProxy from './app/components/plugin-manager-proxy'

export class RemixAppManager extends AppManagerApi {

  constructor (store, swapPanelApi, mainPanelApi, verticalIconsApi) {
    super(null)
    this.location = {
      'default': swapPanelApi,
      'swapPanel': swapPanelApi,
      'mainPanel': mainPanelApi
    }
    this.store = store
    this.verticalIconsApi = verticalIconsApi
    this.swapPanelApi = swapPanelApi
    this.hiddenNodes = {}
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
    if (entity && entity.profile.icon && entity.api.render && typeof entity.api.render === 'function') {
      // here we have an internal module (it does not need to be rendered necessarily - "rendered" means pushed to the DOM)
      // if it contains `render` function, we push the view to `resolveLocation`
      isActive ? this.resolveLocation(entity.profile, entity.api.render())
        : this.removeComponent(entity.profile)
    }
    // at this point, if it's an iframe plugin, it should have already been rendered (to the DOM)
    // either using `location` in json profile or using the optionnal api in the `Plugin` class

    // temp
    if (entity && name === 'solidity') {
      isActive ? this.data.proxy.register(entity.api) : this.data.proxy.unregister(entity.api)
    }
    isActive ? this.store.activate(name) : this.store.deactivate(name)
  }

  getEntity (entityName) {
    return this.store.get(entityName)
  }

  addEntity (entity) {
    this.store.add(entity.profile.name, entity)
  }

  resolveLocation (profile, domEl) {
    // if there's an icon, we add to the swap panel
    // if not we suppose it just need to be put to DOM (that would be)
    if (profile.icon) {
      var panel = this.location[profile.prefferedLocation] ? this.location[profile.prefferedLocation] : this.location['default']
      domEl.style.height = '100%'
      domEl.style.width = '100%'
      domEl.style.border = '0'
      panel.add(profile, domEl)
      this.verticalIconsApi.addIcon(profile)
      return
    }
    this.hiddenNodes[profile.name] = domEl
    document.body.appendChild(domEl)
  }

  removeComponent (profile) {
    if (profile.icon) {
      this.swapPanelApi.remove(profile)
      this.verticalIconsApi.removeIcon(profile)
      return
    }
    let hiddenNode = this.hiddenNodes[profile.name]
    if (hiddenNode) document.body.removeChild(hiddenNode)
  }

  plugins () {
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
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwb2x5Z29uIGZpbGw9Im5vbmUiIHBvaW50cz0iNDksMTQgMzYsMjEgMzYsMjkgICA0OSwzNiAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zNiwzNmMwLDIuMjA5LTEuNzkxLDQtNCw0ICBINWMtMi4yMDksMC00LTEuNzkxLTQtNFYxNGMwLTIuMjA5LDEuNzkxLTQsNC00aDI3YzIuMjA5LDAsNCwxLjc5MSw0LDRWMzZ6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
      prefferedLocation: 'mainPanel'
    }
    return [{ profile: ethDoc, api: new Plugin(ethDoc, { resolveLocaton: (iframe) => { return this.resolveLocation(ethDoc, iframe) } }) },
            { profile: pipeline, api: new Plugin(pipeline, { resolveLocaton: (iframe) => { return this.resolveLocation(pipeline, iframe) } }) }]
  }
}
