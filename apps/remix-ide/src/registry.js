// const moduleID = require('./module-id.js')

module.exports = class registry {
  constructor () {
    this.state = {}
  }

  put ({ api, name }) {
    // const serveruid = moduleID() + '.' + (name || '')
    if (this.state[name]) return this.state[name]
    const server = {
      // uid: serveruid,
      api
    }
    this.state[name] = { server }
    return server
  }

  get (name) {
    // const clientuid = moduleID()
    const state = this.state[name]
    if (!state) return
    const server = state.server
    return server
  }
}
