const yo = require('yo-yo')
const csjs = require('csjs-inject')
const EventEmitter = require('events')
const LocalPlugin = require('./local-plugin')
import { ViewPlugin, IframePlugin, WebsocketPlugin } from '@remixproject/engine'
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
  .pluginSearchInput {
    height: 38px;
  }
  .pluginSearchButton {
    font-size: 13px;
  }
  .displayName {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .description {
    font-size: 13px;
    line-height: 18px;
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
    padding: 4px;
    margin: 0 8px;
    font-weight: 700;
    font-size: 9px;
    line-height: 12px;
    text-transform: uppercase;
    cursor: default;
    border: 1px solid;
    border-radius: 2px;
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
      versionWarning = yo`<small title="Version Alpha" class="${css.versionWarning} plugin-version">alpha</small>`
    }
    // Beta
    if (api.profile.version && api.profile.version.match(/\b(\w*beta\w*)\b/g)) {
      versionWarning = yo`<small title="Version Beta" class="${css.versionWarning} plugin-version">beta</small>`
    }

    const activationButton = isActive
      ? yo`
      <button onclick="${_ => this.appManager.deactivateOne(name)}" class="btn btn-secondary btn-sm" data-id="pluginManagerComponentDeactivateButton${name}">
        Deactivate
      </button>`
      : yo`
      <button onclick="${_ => this.appManager.activateOne(name)}" class="btn btn-success btn-sm" data-id="pluginManagerComponentActivateButton${name}">
        Activate
      </button>`

    return yo`
      <article id="remixPluginManagerListItem_${name}" class="list-group-item py-1 plugins-list-group-item" title="${displayName}" >
        <div class="${css.row} justify-content-between align-items-center mb-2">
          <h6 class="${css.displayName} plugin-name">
            ${displayName}
            ${versionWarning}
          </h6>
          ${activationButton}
        </div>
        <p class="${css.description} text-body plugin-text">${api.profile.description}</p>
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

      const plugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
      this.appManager.registerOne(plugin)
      this.appManager.activateOne(profile.name)
    } catch (err) {
      // TODO : Use an alert to handle this error instead of a console.log
      console.log(`Cannot create Plugin : ${err.message}`)
      addToolTip(`Cannot create Plugin : ${err.message}`)
    }
  }

  render () {
    // Filtering helpers
    const isFiltered = (api) => (api.profile.displayName ? api.profile.displayName : api.name).toLowerCase().includes(this.filter)
    const isNotRequired = ({profile}) => !this.appManager.isRequired(profile.name)
    const isNotHome = ({profile}) => profile.name !== 'home'
    const sortByName = (a, b) => {
      const nameA = ((a.profile.displayName) ? a.profile.displayName : a.profile.name).toUpperCase()
      const nameB = ((b.profile.displayName) ? b.profile.displayName : b.profile.name).toUpperCase()
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
    }

    // Filter all active and inactive modules that are not required
    const { actives, inactives } = this.appManager.getAll()
      .filter(isFiltered)
      .filter(isNotRequired)
      .filter(isNotHome)
      .sort(sortByName)
      .reduce(({actives, inactives}, api) => {
        return this.appManager.isActive(api.name)
          ? { actives: [...actives, api.name], inactives }
          : { inactives: [...inactives, api.name], actives }
      }, { actives: [], inactives: [] })

    const activeTile = actives.length !== 0
      ? yo`
      <nav class="plugins-list-header justify-content-between navbar navbar-expand-lg bg-light navbar-light align-items-center">
        <span class="navbar-brand plugins-list-title">Active Modules</span>
        <span class="badge badge-primary" data-id="pluginManagerComponentActiveTilesCount">${actives.length}</span>
      </nav>`
      : ''
    const inactiveTile = inactives.length !== 0
      ? yo`
      <nav class="plugins-list-header justify-content-between navbar navbar-expand-lg bg-light navbar-light align-items-center">
        <span class="navbar-brand plugins-list-title h6 mb-0 mr-2">Inactive Modules</span>
        <span class="badge badge-primary" style = "cursor: default;" data-id="pluginManagerComponentInactiveTilesCount">${inactives.length}</span>
      </nav>`
      : ''

    const settings = new PluginManagerSettings().render()

    const rootView = yo`
      <div id='pluginManager' data-id="pluginManagerComponentPluginManager">
        <header class="form-group ${css.pluginSearch} plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
          <input onkeyup="${e => this.filterPlugins(e)}" class="${css.pluginSearchInput} form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput">
          <button onclick="${_ => this.openLocalPlugin()}" class="${css.pluginSearchButton} btn bg-transparent text-dark border-0 mt-2 text-underline" data-id="pluginManagerComponentPluginSearchButton">
            Connect to a Local Plugin
          </button>
        </header>
        <section data-id="pluginManagerComponentPluginManagerSection">
          ${activeTile}
          <div class="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
            ${actives.map(name => this.renderItem(name))}
          </div>
          ${inactiveTile}
          <div class="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentInactiveTile">
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
