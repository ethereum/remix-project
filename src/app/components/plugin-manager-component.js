const yo = require('yo-yo')
const csjs = require('csjs-inject')
const EventEmitter = require('events')
const LocalPlugin = require('./local-plugin')
import { Plugin } from 'remix-plugin'

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
  }
  .localPluginBtn {
    margin-top: 10px;
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

class PluginManagerComponent {

  constructor () {
    this.event = new EventEmitter()
    this.views = {
      root: null,
      items: {}
    }
    this.localPlugin = new LocalPlugin()
    this.filter = ''
  }

  profile () {
    return {
      displayName: 'plugin manager',
      name: 'pluginManager',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNzU1IDQ1M3EzNyAzOCAzNyA5MC41dC0zNyA5MC41bC00MDEgNDAwIDE1MCAxNTAtMTYwIDE2MHEtMTYzIDE2My0zODkuNSAxODYuNXQtNDExLjUtMTAwLjVsLTM2MiAzNjJoLTE4MXYtMTgxbDM2Mi0zNjJxLTEyNC0xODUtMTAwLjUtNDExLjV0MTg2LjUtMzg5LjVsMTYwLTE2MCAxNTAgMTUwIDQwMC00MDFxMzgtMzcgOTEtMzd0OTAgMzcgMzcgOTAuNS0zNyA5MC41bC00MDAgNDAxIDIzNCAyMzQgNDAxLTQwMHEzOC0zNyA5MS0zN3Q5MCAzN3oiLz48L3N2Zz4=',
      description: 'start/stop services, modules and plugins',
      kind: 'settings'
    }
  }

  setApp (appManager) {
    this.appManager = appManager
  }

  setStore (store) {
    this.store = store
    this.store.event.on('activate', (name) => { this.reRender() })
    this.store.event.on('deactivate', (name) => { this.reRender() })
    this.store.event.on('add', (entity) => { this.reRender() })
    this.store.event.on('remove', (entity) => { this.reRender() })
  }

  renderItem (name) {
    const mod = this.store.getOne(name)
    if (!mod) return
    const isActive = this.store.actives.includes(name)
    const displayName = (mod.profile.displayName) ? mod.profile.displayName : name

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
      <article class="list-group-item" title="${name}" >
        <div class="${css.row} justify-content-between align-items-center">
          <h6 class="${css.displayName}">${displayName}</h6>
          ${activationButton}
        </div>
        <p class="${css.description}">${mod.profile.description}</p>
      </article>
    `
  }

  /***************
   * SUB-COMPONENT
   */
  /**
   * Add a local plugin to the list of plugins
   */
  async openLocalPlugin() {
    const profile = await this.localPlugin.open(this.store.getAll())
    const resolveLocaton = (iframe) => this.appManager.resolveLocation(profile, iframe)
    const api = new Plugin(profile, { resolveLocaton })
    this.appManager.init([{profile, api}])
    console.log(this.store)
  }

  render () {
    // Filtering helpers
    const isFiltered = ({profile}) => profile.name.toLowerCase().includes(this.filter)
    const isNotRequired = ({profile}) => !profile.required
    const sortByName = (a, b) => {
      const nameA = a.profile.name.toUpperCase()
      const nameB = b.profile.name.toUpperCase()
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
    }

    // Filter all active and inactive modules that are not required
    const { actives, inactives } = this.store.getAll()
      .filter(isFiltered)
      .filter(isNotRequired)
      .sort(sortByName)
      .reduce(({actives, inactives}, {profile}) => {
        return this.store.actives.includes(profile.name)
          ? { actives: [...actives, profile.name], inactives }
          : { inactives: [...inactives, profile.name], actives }
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
          <button onclick="${_ => this.openLocalPlugin()}" class="btn btn-sm ${css.localPluginBtn}">
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
