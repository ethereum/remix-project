const yo = require('yo-yo')
const csjs = require('csjs-inject')
const EventEmitter = require('events')
const LocalPlugin = require('./local-plugin')
import { ViewPlugin, IframePlugin } from '@remixproject/engine'
import { PluginManagerSettings } from './plugin-manager-settings'
import * as packageJson from '../../../package.json'
const addToolTip = require('../ui/tooltip')

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
    display: flex;
    flex-direction: column;
    align-items: flex-start;
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
  .versionWarning {
    background-color: var(--light);
    padding: 0 7px;
    font-weight: bolder;
    margin-top: 5px;
    text-transform: lowercase;
    cursor: default;
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
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/plugin_manager.html',
  version: packageJson.version
}

class PluginManagerComponent extends ViewPlugin {

  constructor (appManager) {
    super(profile)
    this.event = new EventEmitter()
    this.appManager = appManager
    this.views = {
      root: null,
      items: {}
    }
    this.localPlugin = new LocalPlugin()
    this.filter = ''
    this.appManager.event.on('activate', () => { this.reRender() })
    this.appManager.event.on('deactivate', () => { this.reRender() })
    this.appManager.event.on('added', () => { this.reRender() })
  }

  renderItem (name) {
    const api = this.appManager.getOne(name)
    if (!api) return
    const isActive = this.appManager.isActive(name)
    const displayName = (api.profile.displayName) ? api.profile.displayName : name

    // Check version of the plugin
    let versionWarning
    // Alpha
    if (api.profile.version && api.profile.version.match(/\b(\w*alpha\w*)\b/g)) {
      versionWarning = yo`<small title="Version Alpha" class="${css.versionWarning}">alpha</small>`
    }
    // Beta
    if (api.profile.version && api.profile.version.match(/\b(\w*beta\w*)\b/g)) {
      versionWarning = yo`<small title="Version Beta" class="${css.versionWarning}">beta</small>`
    }

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
      <article id="remixPluginManagerListItem_${name}" class="list-group-item py-1" title="${displayName}" >
        <div class="${css.row} justify-content-between align-items-center">
          <h6 class="${css.displayName}">
            ${displayName}
            ${versionWarning}
          </h6>
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
      const profile = await this.localPlugin.open(this.appManager.getAll())
      if (!profile) return
      if (this.appManager.getIds().includes(profile.name)) {
        throw new Error('This name has already been used')
      }
      this.appManager.registerOne(new IframePlugin(profile))
      this.appManager.activateOne(profile.name)
    } catch (err) {
      // TODO : Use an alert to handle this error instead of a console.log
      console.log(`Cannot create Plugin : ${err.message}`)
      addToolTip(`Cannot create Plugin : ${err.message}`)
    }
  }

  render () {
    // Filtering helpers
    const isFiltered = (api) => api.name.toLowerCase().includes(this.filter)
    const isNotRequired = ({profile}) => !this.appManager.isRequired(profile.name)
    const sortByName = (a, b) => {
      const nameA = a.name.toUpperCase()
      const nameB = b.name.toUpperCase()
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
    }

    // Filter all active and inactive modules that are not required
    const { actives, inactives } = this.appManager.getAll()
      .filter(isFiltered)
      .filter(isNotRequired)
      .sort(sortByName)
      .reduce(({actives, inactives}, api) => {
        return this.appManager.isActive(api.name)
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
        <span class="badge badge-pill badge-primary" style = "cursor: default;">${inactives.length}</span>
      </nav>`
      : ''

    const settings = new PluginManagerSettings().render()

    const rootView = yo`
      <div id='pluginManager'>
        <header class="form-group ${css.pluginSearch}">
          <input onkeyup="${e => this.filterPlugins(e)}" class="form-control" placeholder="Search">
          <button onclick="${_ => this.openLocalPlugin()}" class="btn btn-sm text-info ${css.localPluginBtn}">
            Connect to a Local Plugin
          </button>
        </header>
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
        ${settings}
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
