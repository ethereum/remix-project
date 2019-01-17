var yo = require('yo-yo')
var csjs = require('csjs-inject')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

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
      name: 'plugin manager',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNzU1IDQ1M3EzNyAzOCAzNyA5MC41dC0zNyA5MC41bC00MDEgNDAwIDE1MCAxNTAtMTYwIDE2MHEtMTYzIDE2My0zODkuNSAxODYuNXQtNDExLjUtMTAwLjVsLTM2MiAzNjJoLTE4MXYtMTgxbDM2Mi0zNjJxLTEyNC0xODUtMTAwLjUtNDExLjV0MTg2LjUtMzg5LjVsMTYwLTE2MCAxNTAgMTUwIDQwMC00MDFxMzgtMzcgOTEtMzd0OTAgMzcgMzcgOTAuNS0zNyA5MC41bC00MDAgNDAxIDIzNCAyMzQgNDAxLTQwMHEzOC0zNyA5MS0zN3Q5MCAzN3oiLz48L3N2Zz4=',
      description: 'start/stop services, modules and plugins'
    }
  }

  setApp (appManager) {
    this.appManager = appManager
  }

  setStore (store) {
    this.store = store
    this.store.event.on('activate', (name) => { this.reRender() })
    this.store.event.on('deactivate', (name) => { this.reRender() })
    this.store.event.on('add', (name) => { this.reRender() })
    this.store.event.on('remove', (name) => { this.reRender() })
  }

  render () {
    this.views.activeMods = yo`
    <div id='activePlugs class=${css.activePlugins}>
      <h3>Active Modules</h3>
    </div>
    `
    this.views.inactiveMods = yo`
    <div class=${css.inactivePlugins}>
      <h3>Inactive Modules</h3>
    </div>
    `
    var rootView = yo`
      <div id='pluginManager' class=${css.plugins_settings} >
        <h2>Plugin Manager</h2>
        <input placeholder="Search loaded plugins">
        ${this.views.activeMods}
        ${this.views.inactiveMods}
      </div>
    `

    var modulesActive = this.store.getActives()
    modulesActive.sort(function (a, b) {
      var textA = a.profile.name.toUpperCase();
      var textB = b.profile.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })

    modulesActive.forEach((mod) => {
      this.views.activeMods.appendChild(this.renderItem(mod.profile.name))
    })

    var modulesAll = this.store.getAll()
    modulesAll.sort()
    modulesAll.forEach((mod) => {
      if (!modulesActive.includes(mod)) {
        this.views.inactiveMods.appendChild(this.renderItem(mod.profile.name))
      }
    })
    if (!this.views.root) {
      this.views.root = rootView
    }
    return rootView
  }

  renderItem (item) {
    let ctrBtns

    const mod = this.store.getOne(item)
    if (!mod) return
    let action = () => {
      if (this.store.isActive(item)) {
        this.appManager.deactivateOne(item)
      } else {
        this.appManager.activateOne(item)
      }
    }

    ctrBtns = yo`<div id='${item}Activation'>
        <button onclick=${(event) => { action(event) }} >${this.store.isActive(item) ? 'deactivate' : 'activate'}</button>
        </div>`

    this.views.items[item] = yo`
      <div id=${item} class=${css.plugin} >
        <h3>${mod.profile.name}</h3>
        ${mod.profile.description}
        ${ctrBtns}
      </div>
    `
    return this.views.items[item]
  }

  reRender () {
    if (this.views.root) {
      yo.update(this.views.root, this.render())
    }
  }
}

module.exports = PluginManagerComponent

const css = csjs`
  .plugins_settings h2 {
    font-size: 1em;
    border-bottom: 1px ${styles.appProperties.solidBorderBox_BorderColor} solid;
    padding: 10px 20px;
    font-size: 10px;
    padding: 10px 20px;
    text-transform: uppercase;
    font-weight: normal;
    background-color: white;
    margin-bottom: 0;
  }
  .plugin {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    margin: 0;
    margin-bottom: 2%;
    border-bottom: 1px ${styles.appProperties.solidBorderBox_BorderColor} solid;
    padding: 0px 20px 10px;
  }
  .plugin h3 {
    margin-bottom: 5px;
    font-size: 12px;
    margin-top: 9px;
  }

  .plugin button {
    ${styles.rightPanel.settingsTab.button_LoadPlugin};
    cursor: pointer;
    font-size: 10px;
  }
  .activePlugins {
  }

  .inactivePlugins {
  }
  .plugins_settings input {
    margin: 10px;
  }
`
