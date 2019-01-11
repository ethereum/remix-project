import { AppManagerApi } from 'remix-plugin'
import { EventEmitter } from 'events'

export class RemixAppManager extends AppManagerApi {

  constructor (store) {
    super(null)
    this.store = store
    this.event = new EventEmitter()
  }

  doActivate (name) {
    this.activateOne(name)
    // temp
    this.store.activate(name)
    // promise ?
    const entity = this.getEntity(name)
    if (entity.profile.icon && entity.api.render && typeof entity.api.render === 'function') {
      this.event.emit('requestContainer', entity.profile, entity.api.render()) 
    }
  }

  doDeactivate (name) {
    this.deactivateOne(name)
    // temp
    this.store.deactivate(name)
    // promise ?
    const entity = this.getEntity(name)
    if (entity.profile.icon && entity.api.render && typeof entity.api.render === 'function') {
      this.event.emit('removingItem', entity.profile)
    }
  }

  setActive (name, isActive) {
    isActive ? this.store.activate(name) : this.store.deactivate(name)
  }

  getEntity (entityName) {
    return this.store.get(entityName)
  }

  addEntity (entity) {
    this.store.add(entity.profile.name, entity)
  }
}