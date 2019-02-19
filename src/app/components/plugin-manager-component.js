const yo = require('yo-yo')
const csjs = require('csjs-inject')

const EventEmitter = require('events')

const css = csjs`
  .pluginManager {
    padding: 10px;
  }
`

class PluginManagerComponent {

  constructor () {
    this.event = new EventEmitter()
    this.views = {
      root: null,
      items: {}
    }
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

  renderItem (item) {
    const mod = this.store.getOne(item)
    if (!mod) return
    const isActive = this.store.actives.includes(mod.profile.name)
    const displayName = (mod.profile.displayName) ? mod.profile.displayName : mod.profile.name

    const input = isActive
      ? yo`<input onchange="${_ => this.appManager.deactivateOne(item)}" checked type="checkbox" class="form-check-input">`
      : yo`<input onchange="${_ => this.appManager.activateOne(item)}" type="checkbox" class="form-check-input">`

    return yo`
      <article class="plugin" id="${mod.profile.name}" title="${item}" >
        <div id="${mod.profile.name}Activation" class="form-check row align-items-center">
          ${input}
          <h6 class="form-check-label">${displayName}</h6>
        </div>
        <p>${mod.profile.description}</p>
      </article>
    `
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
      ? yo`<h3>Active Modules</h3>`
      : ''
    const inactiveTile = inactives.length !== 0
      ? yo`<h3>Inactive Modules</h3>`
      : ''

    const rootView = yo`
      <section id="${css.pluginManager}">
        <h2>Plugin Manager</h2>
        <hr/>
        <div class="form-group">
          <input onkeyup="${e => this.filterPlugins(e)}" class="form-control" placeholder='Search'>
        </div>
        ${activeTile}
        ${actives.map(name => this.renderItem(name))}
        ${inactiveTile}
        ${inactives.map(name => this.renderItem(name))}
      </section>
    `
    if (!this.views.root) this.views.root = rootView
    return rootView
  }

  reRender () {
    if (this.views.root) {
      yo.update(this.views.root, this.render())
      this.filterPlugins(this.searchBox())
    }
  }

  filterPlugins ({ target }) {
    this.filter = target.value.toLowerCase()
    this.reRender()
  }
}

module.exports = PluginManagerComponent
