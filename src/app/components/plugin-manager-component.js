var yo = require('yo-yo')
var csjs = require('csjs-inject')

// const styleguide = require('../ui/styles-guide/theme-chooser')
// const styles = styleguide.chooser()

const EventEmitter = require('events')

class PluginManagerComponent {

  constructor () {
    this.event = new EventEmitter()
    this.views = {
      root: null,
      items: {}
    }
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

  render () {
    let activeMods = yo`
    <div id='activePlugs' class=${css.activePlugins}>
      <h3>Active Modules</h3>
    </div>
    `
    let inactiveMods = yo`
    <div id='inActivePlugs' class=${css.inactivePlugins}>
      <h3>Inactive Modules</h3>
    </div>
    `
    let searchbox = yo`
    <input id='filter_plugins' placeholder='Search'>
    `
    var rootView = yo`
      <div id='pluginManager' class=${css.plugins_settings} >
        <h2>Plugin Manager</h2>
        ${searchbox}
        ${activeMods}
        ${inactiveMods}
      </div>
    `

    searchbox.addEventListener('keyup', (event) => { this.filterPlugins(event.target) })

    var modulesActiveNotReq = this.store.getActives().filter(({profile}) => !profile.required)
    this.sortObject(modulesActiveNotReq)

    if (modulesActiveNotReq.length > 0) {
      modulesActiveNotReq.forEach((mod) => {
        activeMods.appendChild(this.renderItem(mod.profile.name))
      })
      activeMods.style.display = 'block'
    } else {
      activeMods.style.display = 'none'
    }

    var modulesAllNotReq = this.store.getAll().filter(({profile}) => !profile.required)
    this.sortObject(modulesAllNotReq)
    modulesAllNotReq.forEach((mod) => {
      if (!modulesActiveNotReq.includes(mod)) {
        inactiveMods.appendChild(this.renderItem(mod.profile.name))
      }
    })
    if (!this.views.root) {
      this.views.root = rootView
    }
    return rootView
  }

  searchBox () {
    if (this.views.root) {
      return this.views.root.querySelector('#filter_plugins')
    }
    return null
  }

  sortObject (obj) {
    obj.sort((a, b) => {
      var textA = a.profile.name.toUpperCase()
      var textB = b.profile.name.toUpperCase()
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
    })
  }

  renderItem (item) {
    let ctrBtns

    const mod = this.store.getOne(item)
    if (!mod) return
    let displayName = (mod.profile.displayName) ? mod.profile.displayName : mod.profile.name
    let action = () => {
      if (this.store.isActive(item)) {
        this.appManager.deactivateOne(item)
      } else {
        this.appManager.activateOne(item)
      }
    }

    ctrBtns = yo`<div id='${mod.profile.name}Activation'>
        <button class='btn btn-sm btn-primary' onclick=${(event) => { action(event) }} >${this.store.isActive(item) ? 'deactivate' : 'activate'}</button>
        </div>`

        // <div id='${mod.profile.name}Activation' class="custom-control custom-switch">
        //   <input type="checkbox" class="custom-control-input" id="customSwitch1">
        //   <label class="custom-control-label" for="customSwitch1">Toggle this switch element</label>
        // </div>

    return yo`
    <div id=${mod.profile.name} title="${item}" class="card ${css.plugin}" >
      <h3>${displayName}</h3>
      ${mod.profile.description}
      ${ctrBtns}
    </div>
    `
  }

  reRender () {
    if (this.views.root) {
      yo.update(this.views.root, this.render())
      this.filterPlugins(this.searchBox())
    }
  }

  filterPlugins (target) {
    if (!target) return
    let filterOn = target.value.toUpperCase()
    var nodes = this.views.root.querySelectorAll(`.${css.plugin}`)
    nodes.forEach((node) => {
      let h = node.querySelector('h3')
      let txtValue = h.textContent || h.innerText
      if (txtValue.toLowerCase().indexOf(filterOn.toLowerCase()) !== -1) {
        node.style.display = 'block'
      } else {
        node.style.display = 'none'
      }
    })
  }
}

module.exports = PluginManagerComponent

const css = csjs`
  .plugins_settings h2 {
    font-size: 1em;
    border-bottom: 1px red solid;
    padding: 10px 20px;
    font-size: 10px;
    padding: 10px 20px;
    text-transform: uppercase;
    font-weight: normal;
    background-color: white;
    margin-bottom: 0;
  }
  .plugin {
    margin: 0;
    margin-bottom: 2%;
    padding: 0px 20px 10px;
  }
  .plugin h3 {
    margin-bottom: 5px;
    font-size: 12px;
    margin-top: 9px;
  }

  .plugin button {
    font-size: 10px;
  }
  .activePlugins {
  }

  .inactivePlugins {
  }
  .plugins_settings input {
    margin: 10px;
  }
  .hideIt {
    display: none;
  }
`
