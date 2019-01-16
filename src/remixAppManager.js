import { AppManagerApi } from 'remix-plugin'
import { EventEmitter } from 'events'
import PluginManagerProxy from './app/components/plugin-manager-proxy'

export class RemixAppManager extends AppManagerApi {

  constructor (store) {
    super(null)
    this.store = store
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
      isActive ? this.event.emit('requestContainer', entity.profile, entity.api.render())  
        : this.event.emit('removingItem', entity.profile)
    }
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
}
