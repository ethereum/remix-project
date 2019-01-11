var yo = require('yo-yo')
var csjs = require('csjs-inject')

const FilePanel = require('../panels/file-panel')
const CompileTab = require('../tabs/compile-tab')
const SettingsTab = require('../tabs/settings-tab')
const AnalysisTab = require('../tabs/analysis-tab')
const DebuggerTab = require('../tabs/debugger-tab')
const SupportTab = require('../tabs/support-tab')
const TestTab = require('../tabs/test-tab')
const RunTab = require('../tabs/run-tab')

var registry = require('../../global/registry')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()
import { EntityStore } from '../../lib/store.js'

const PluginManagerProxy = require('./plugin-manager-proxy')

const EventEmitter = require('events')

class PluginManagerComponent {

  constructor () {
    this.event = new EventEmitter()
    this.data = {
      proxy: new PluginManagerProxy()
    }
    this.views = {
      root: null,
      items: {}
    }
  }

  profile () {
    return {
      name: 'PluginManager',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9IiAgTTMyLDM1YzAsMCw4LjMxMiwwLDkuMDk4LDBDNDUuNDYzLDM1LDQ5LDMxLjQ2Myw0OSwyNy4wOTlzLTMuNTM3LTcuOTAyLTcuOTAyLTcuOTAyYy0wLjAyLDAtMC4wMzgsMC4wMDMtMC4wNTgsMC4wMDMgIGMwLjA2MS0wLjQ5NCwwLjEwMy0wLjk5NCwwLjEwMy0xLjUwNGMwLTYuNzEtNS40MzktMTIuMTUtMTIuMTUtMTIuMTVjLTUuMjI5LDAtOS42NzIsMy4zMDktMTEuMzg2LDcuOTQxICBjLTEuMDg3LTEuMDg5LTIuNTkxLTEuNzY0LTQuMjUxLTEuNzY0Yy0zLjMxOSwwLTYuMDA5LDIuNjktNi4wMDksNi4wMDhjMCwwLjA4NSwwLjAxLDAuMTY3LDAuMDEzLDAuMjUxICBDMy42OTUsMTguOTk1LDEsMjIuMzQ0LDEsMjYuMzMxQzEsMzEuMTE5LDQuODgxLDM1LDkuNjcsMzVjMC44MjcsMCw4LjMzLDAsOC4zMywwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgZmlsbD0ibm9uZSIgcG9pbnRzPSIzMCw0MSAyNSw0NiAyMCw0MSAgICIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIiB4MT0iMjUiIHgyPSIyNSIgeTE9IjI2IiB5Mj0iNDUuNjY4Ii8+PC9zdmc+'
    }
  }

  setApp (appManager) {
    this.appManager = appManager
  }

  setStore (store) {
    this.store = store
    this.store.event.on('activate', (name) => { this.views.items[name] ? this.views.items[name].querySelector('button').innerHTML = 'deactivate' : null })
    this.store.event.on('deactivate', (name) => { this.views.items[name] ? this.views.items[name].querySelector('button').innerHTML = 'activate' : null })
  }

  proxy () {
    return this.data.proxy
  }

  render () {
    this.views.root = yo`
      <div id='pluginManager' class=${css.plugins} >
      <h2>Plugin Manager</h2>
      </div>
    `
    var modules = this.store.getAll()
    modules.forEach((mod) => {
      this.views.root.appendChild(this.renderItem(mod.profile.name))
    })
    return this.views.root
  }

  renderItem (item) {
    let ctrBtns

    const mod = this.store.getOne(item)
    if (!mod) return
    let action = () => { this.store.isActive(item) ? this.appManager.doDeactivate(item) : this.appManager.doActivate(item) }

    ctrBtns = yo`<div id='${item}Activation'>
        <button onclick=${(event) => { action(event) }} >${this.store.isActive(item) ? 'deactivate' : 'activate'}</button>
        </div>`

    this.views.items[item] = yo`
      <div id='pluginManager' class=${css.plugin} >
        <h3>${mod.profile.name}</h3>
        ${mod.profile.description}
        ${ctrBtns}
      </div>
    `
    
    return this.views.items[item]
  }
}

module.exports = PluginManagerComponent

const css = csjs`
  .plugins {
  }
  .plugins h2 {
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

  .plugItIn.active {
    display: block;
  }
  .plugin button {
    ${styles.rightPanel.settingsTab.button_LoadPlugin};
    cursor: pointer;
    font-size: 10px;
  }
`
