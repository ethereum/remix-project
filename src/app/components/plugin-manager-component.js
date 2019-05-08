const yo = require('yo-yo')
const csjs = require('csjs-inject')
const EventEmitter = require('events')
const LocalPlugin = require('./local-plugin')
import { Plugin, BaseApi } from 'remix-plugin'

const css = csjs`
  .pluginSearch {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--light);
    padding: 10px;
    position: sticky;
    top: 0;
    z-index: 2;
    margin-bottom: 0px;
  }
  .localPluginBtn {
    margin-top: 15px;
  }
  .displayName {
    text-transform: capitalize;
  }
  .description {
    text-transform: capitalize;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .isStuck {
    background-color: var(--primary);
    color: 
  }
`

const profile = {
  name: 'pluginManager',
  displayName: 'Plugin manager',
  methods: [],
  events: [],
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNzU1IDQ1M3EzNyAzOCAzNyA5MC41dC0zNyA5MC41bC00MDEgNDAwIDE1MCAxNTAtMTYwIDE2MHEtMTYzIDE2My0zODkuNSAxODYuNXQtNDExLjUtMTAwLjVsLTM2MiAzNjJoLTE4MXYtMTgxbDM2Mi0zNjJxLTEyNC0xODUtMTAwLjUtNDExLjV0MTg2LjUtMzg5LjVsMTYwLTE2MCAxNTAgMTUwIDQwMC00MDFxMzgtMzcgOTEtMzd0OTAgMzcgMzcgOTAuNS0zNyA5MC41bC00MDAgNDAxIDIzNCAyMzQgNDAxLTQwMHEzOC0zNyA5MS0zN3Q5MCAzN3oiLz48L3N2Zz4=',
  description: 'Start/stop services, modules and plugins',
  kind: 'settings',
  location: 'swapPanel'
}

class PluginManagerComponent extends BaseApi {

  constructor () {
    super(profile)
    this.event = new EventEmitter()
    this.views = {
      root: null,
      items: {}
    }
    this.localPlugin = new LocalPlugin()
    this.filter = ''
  }

  setApp (appManager) {
    this.appManager = appManager
  }

  setStore (store) {
    this.store = store
    this.store.event.on('activate', (name) => { this.reRender() })
    this.store.event.on('deactivate', (name) => { this.reRender() })
    this.store.event.on('add', (api) => { this.reRender() })
    this.store.event.on('remove', (api) => { this.reRender() })
  }

  renderItem (name) {
    const api = this.store.getOne(name)
    if (!api) return
    const isActive = this.store.actives.includes(name)
    const displayName = (api.profile.displayName) ? api.profile.displayName : name

    const activationButton = isActive
      ? yo`
      <button onclick="${_ => this.appManager.deactivateOne(name)}" class="btn btn-secondary btn-sm">
        Deactivate
      </button>`
      : yo`
      <button onclick="${_ => this.appManager.activateOne(name)}" class="btn btn-success btn-sm">
        Activate
      </button>`

    return yo`
      <article class="list-group-item py-1" title="${name}" >
        <div class="${css.row} justify-content-between align-items-center">
          <h6 class="${css.displayName}">${displayName}</h6>
          ${activationButton}
        </div>
        <p class="${css.description}">${api.profile.description}</p>
      </article>
    `
  }

  /***************
   * SUB-COMPONENT
   */
  /**
   * Add a local plugin to the list of plugins
   */
  async openLocalPlugin () {
    try {
      const profile = await this.localPlugin.open(this.store.getAll())
      if (!profile) return
      this.appManager.registerOne(new Plugin(profile))
      this.appManager.activateOne(profile.name)
    } catch (err) {
      // TODO : Use an alert to handle this error instead of a console.log
      console.log(`Cannot create Plugin : ${err.message}`)
    }
  }

  render () {
    // Filtering helpers
    const isFiltered = (api) => api.name.toLowerCase().includes(this.filter)
    const isNotRequired = ({profile}) => !profile.required
    const sortByName = (a, b) => {
      const nameA = a.name.toUpperCase()
      const nameB = b.name.toUpperCase()
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
    }

    // Filter all active and inactive modules that are not required
    const { actives, inactives } = this.store.getAll()
      .filter(isFiltered)
      .filter(isNotRequired)
      .sort(sortByName)
      .reduce(({actives, inactives}, api) => {
        return this.store.actives.includes(api.name)
          ? { actives: [...actives, api.name], inactives }
          : { inactives: [...inactives, api.name], actives }
      }, { actives: [], inactives: [] })

    const activeTile = actives.length !== 0
      ? yo`
      <nav class="navbar navbar-expand-lg navbar-light bg-light justify-content-between align-items-center">
        <span class="navbar-brand">Active Modules</span>
        <span class="badge badge-pill badge-primary">${actives.length}</span>
      </nav>`
      : ''
    const inactiveTile = inactives.length !== 0
      ? yo`
      <nav class="navbar navbar-expand-lg navbar-light bg-light justify-content-between align-items-center">
        <span class="navbar-brand">Inactive Modules</span>
        <span class="badge badge-pill badge-primary">${inactives.length}</span>
      </nav>`
      : ''

    const rootView = yo`
      <div id='pluginManager'>
        <div class="form-group ${css.pluginSearch}">
          <input onkeyup="${e => this.filterPlugins(e)}" class="form-control" placeholder="Search">
          <button onclick="${_ => this.openLocalPlugin()}" class="btn btn-sm text-info ${css.localPluginBtn}">
            Connect to a Local Plugin
          </button>
        </div>
        <section>
          ${activeTile}
          <div class="list-group list-group-flush">
            ${actives.map(name => this.renderItem(name))}
          </div>
          ${inactiveTile}
          <div class="list-group list-group-flush">
            ${inactives.map(name => this.renderItem(name))}
          </div>
        </section>
      </div>
    `
    if (!this.views.root) this.views.root = rootView
    return rootView
  }

  reRender () {
    if (this.views.root) {
      yo.update(this.views.root, this.render())
    }
  }

  filterPlugins ({ target }) {
    this.filter = target.value.toLowerCase()
    this.reRender()
  }
}

module.exports = PluginManagerComponent
