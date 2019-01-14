import { EventEmitter } from 'events'

export class Store {

  /**
   * Instanciate the store from `localStorage` first
   * @template T
   * @param {string} name The name of the store
   * @param {T} initialState The initial state used if state is not available in `localStorage`
   */
  static fromLocal(name, initialState) {
    const fromLocal = localStorage.getItem(name)
    const intial = fromLocal ? JSON.parse(fromLocal) : initialState
    return new Store(name, intial)
  }

  /**
   * Create a Store that hold the state of the component
   * @template T
   * @param {string} name The name of the store
   * @param {T} initialState The initial state of the store
   */
  constructor(name, initialState) {
    this.event = new EventEmitter()
    this.name = name
    this.state = initialState
  }

  /** Listen on event from the store */
  get on() {
    return this.event.on;
  }

  /** Liste once on event from the store */
  get once() {
    return this.event.once;
  }

  /**
   * Update one field of the state
   * @param {Partial<T>} state The part of the state updated
   */
  /*
  update(state) {
    this.state = { ...this.state, ...state }
  }
  */

  /**
   * Get one field of the state
   * @template Key key of `this.state`
   * @param {Key} key A key of the state
   */
  get(key) {
    return this.state.entities[key]
  }

  /** Reset the state its initial value */
  reset() {
    this.state = this.initialState
  }

  /** Dispatch an event with the new state */
  dispatch() {
    this.event.emit('newState', this.state)
  }
}

/**
 * An entity inside a collection
 * @typedef {Object} EntityState
 * @property {string[]} ids The list of IDs of the entity in the state
 * @property {string[]} actives The list of IDs of the activated entities
 * @property {Object} entities A map of ids and entities
 */



export class EntityStore extends Store {

  /**
   * Instanciate the store from `localStorage` first
   * @param {string} name The name of the store
   * @param {EntityState} initialState The initial state used if state is not available in `localStorage`
   */
  static fromLocal(name, initialState) {
    const fromLocal = localStorage.getItem(name)
    const intial = fromLocal ? JSON.parse(fromLocal) : initialState
    return new EntityStore(name, intial)
  }

  /**
   * Create a entity Store that hold a map entity of the same model
   * @param {string} name The name of the store
   * @param {EntityState} initialState The initial state used if state is not available in `localStorage`
   */
  constructor(name, initialState) {
    super(name, initialState)
  }

  ////////////
  // GETTER //
  ////////////

  /** Tne entities as a Map */
  get entities() {
    return this.state.entities
  }

  /** List of all the ids */
  get ids() {
    return this.state.ids
  }

  /** List of all active ID */
  get actives() {
    return this.state.actives
  }

  /** Return the length of the entity collection */
  get length() {
    return this.state.ids.length
  }

  /////////////
  // SETTERS //
  /////////////

  /**
   * Add a new entity to the state
   * @param {Object} entity
   */
  add(id, entity) {
    this.state.entities[id] = entity
    this.state.ids.push(id)
  }

  /**
   * Add entities to the state
   * @param {Array} entities
   */
  addEntities(entities) {
    entities.forEach((entity) => { this.add(entity.profile.name, entity) })
  }

  /**
   * Remove an entity from the state
   * @param {(string|number)} id The id of the entity to remove
   */
  remove(id) {
    delete this.state.entities[id]
    this.state.ids.splice(this.state.ids.indexOf(id), 1)
    this.state.actives.splice(this.state.ids.indexOf(id), 1)
  }

  /**
   * Update one entity of the state
   * @param {(string|number)} id The id of the entity to update
   * @param {Object} update The fields to update in the entity
   */
  /*
  updateOne(id, update) {
    this.state.entities[id] = {
      ...this.state.entities[id],
      ...update
    }
  }
  */

  /**
   * Activate one or several entity from the state
   * @param {((string|number))} ids An id or a list of id to activate
   */
  activate(id) {
    this.state.actives.push(id)
    this.event.emit('activate', id)
  }

  /**
   * Deactivate one or several entity from the state
   * @param {(string|number))} ids An id or a list of id to deactivate
   */
  deactivate(id) {
    this.state.actives.splice(this.state.actives.indexOf(id), 1)
    this.event.emit('deactivate', id)
  }

  ///////////
  // QUERY //
  ///////////

  /**
   * Get one entity
   * @param {(string|number)} id The id of the entity to get
   */
  getOne(id) {
    return this.state.entities[id]
  }

  /**
   * Get many entities as an array
   * @param {(string|number)[]} ids An array of id of entity to get
   */
  getMany(ids) {
    return ids.map(id => this.state.entities[id])
  }

  /** Get all the entities as an array */
  getAll() {
    return this.state.ids.map(id => this.state.entities[id])
  }

  /** Get all active entities */
  getActives() {
    return this.state.actives.map(id => this.state.entities[id])
  }

  ////////////////
  // CONDITIONS //
  ////////////////
  
  /**
   * Is the entity active
   * @param {(string|number)} id The id of the entity to check
   */
  isActive(id) {
    return this.state.actives.includes(id)
  }

  /**
   * Is this id inside the store
   * @param {(string|number)} id The id of the entity to check
   */
  hasEntity(id) {
    return this.state.ids.includes(id)
  }

  /**
   * Is the state empty
   * @param {(string|number)} id The id of the entity to check
   */
  isEmpty() {
    return this.state.ids.length === 0
  }
}

/**
 * Store the state of the stores into LocalStorage
 * @param {Store[]} stores The list of stores to store into `localStorage`
 */
function localState(stores) {
  stores.forEach(store => {
    const name = store.name
    store.on('newState', (state) => {
      localStorage.setItem(name, JSON.stringify(state))
    })
  })
}
