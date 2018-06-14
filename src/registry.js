const moduleID = require('./module-id.js')
const remixLib = require('remix-lib')
const EventManager = remixLib.EventManager

module.exports = class registry {
  constructor () {
    this.state = {}
  }
  put ({ api, events, name }) {
    const serveruid = moduleID() + '.' + (name || '')
    console.log('registering ', serveruid)
    if (this.state[serveruid]) return this.state[serveruid]
    const server = {
      uid: serveruid,
      // api: new ApiManager(api),
      events: makeEvents(events),
      legacyEvents: api.event ? api.event : new EventManager()
    }
    this.state[serveruid] = {
      _name: name,
      _api: api,
      _events: events,
      server: server,
      clients: []
    }
    return server
  }
  get (uid) {
    const clientuid = moduleID()
    const state = this.state[uid]
    if (!state) return
    const server = state.server
    const client = {
      uid: clientuid,
      api: state._api,
      events: server.events,
      legacyEvents: server.legacyEvents
    }
    server.clients.push(client)
    return client
  }
}

function makeEvents (events) {
  if (!events) return []
  function update (name) { update[name] = new EventManager() }
  return events.reduce((fn, x) => {
    fn[x] = new EventManager()
    var oldTrigger = fn[x].trigger
    fn[x].trigger = (name, args) => {
      console.log(name)
      oldTrigger.call(fn[x], name, args)
    }
    var oldRegister = fn[x].register
    fn[x].register = (name, obj, fn) => {
      console.log(name)
      oldRegister.call(fn[x], obj, fn)
    }
    return fn
  }, update)
}
