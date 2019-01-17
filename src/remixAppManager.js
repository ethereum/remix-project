import { AppManagerApi, Plugin } from 'remix-plugin'
import { EventEmitter } from 'events'
import PluginManagerProxy from './app/components/plugin-manager-proxy'

export class RemixAppManager extends AppManagerApi {

  constructor (store, swapPanelApi, verticalIconsApi) {
    super(null)
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
    if (entity && name === 'SolidityCompile') {
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
      this.swapPanelApi.add(profile, domEl)
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
      url: 'https://ipfs.io/ipfs/Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ/',
      description: 'generate solidity documentation'
    }
    return [{ profile: ethDoc, api: new Plugin(ethDoc, { resolveLocaton: (iframe) => { return this.resolveLocation(ethDoc, iframe) } }) }]
  }
}
