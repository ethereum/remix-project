/* eslint-disable no-unused-vars */
import {
  IframePlugin,
  ViewPlugin,
  WebsocketPlugin
} from '@remixproject/engine-web'
import { PluginManagerSettings } from './plugin-manager-settings'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import {RemixUiPluginManager} from '@remix-ui/plugin-manager' // eslint-disable-line
import * as packageJson from '../../../../../package.json'
const yo = require('yo-yo')
const csjs = require('csjs-inject')
const EventEmitter = require('events')
const LocalPlugin = require('./local-plugin') // eslint-disable-line
const addToolTip = require('../ui/tooltip')
const _paq = window._paq = window._paq || []

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
  .pluginIcon {
    height: 0.7rem;
    width: 0.7rem;
    filter: invert(0.5);
  }
  .description {
    font-size: 13px;
    line-height: 18px;
  }
  .descriptiontext {
    display: block;
  }
  .descriptiontext:first-letter {
    text-transform: uppercase;
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
  icon: 'assets/img/pluginManager.webp',
  description: 'Start/stop services, modules and plugins',
  kind: 'settings',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/plugin_manager.html',
  version: packageJson.version
}

class PluginManagerComponent extends ViewPlugin {
  constructor (appManager, engine) {
    super(profile)
    // this.event = new EventEmitter() // already exists in engine so not needed here
    this.appManager = appManager
    this.engine = engine
    this.htmlElement = document.createElement('div')
    this.htmlElement.setAttribute('id', 'pluginManager')
    this.views = {
      root: null,
      items: {}
    }
    this.localPlugin = new LocalPlugin()
    this.filter = ''
    this.activePlugins = []
    this.inactivePlugins = []
    this.pluginNames = this.appManager.actives
    // this.appManager.event.on('activate', () => { this.renderComponent() })
    // this.appManager.event.on('deactivate', () => { this.renderComponent() })
    // this.engine.event.on('onRegistration', () => { this.renderComponent() })
  }

  isActive (name) {
    this.appManager.actives.includes(name)
  }

  activateP (name) {
    this.appManager.turnPluginOn(name)
    console.log('activateP method reached. And activation of method was successful')
    _paq.push(['trackEvent', 'manager', 'activate', name])
    this.renderComponent()
    console.log('activation was logged in _paq and renderComponent has been called.')
  }

  deactivateP (name) {
    this.call('manager', 'deactivatePlugin', name)
    console.log('deactivateP has been called successfully')
    _paq.push(['trackEvent', 'manager', 'deactivate', name])
    this.renderComponent()
    console.log('deactivation was logged and renderComponent has has been called.')
  }

  onActivation () {
    this.renderComponent()
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiPluginManager
        profile={profile}
        pluginComponent={this}
        appManager={this.appManager}
        engine={this.engine}
        localPlugin={this.localPlugin}
        activePluginNames={this.pluginNames}
        actives={this.activePlugins}
        inactives={this.inactivePlugins}
        // activatePlugin={this.activateP}
        // deActivatePlugin={this.deactivateP}
        _paq={_paq}
        filter={this.filter}
      />,
      document.getElementById('pluginManager'))
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
      this.engine.register(plugin)
      await this.appManager.activatePlugin(plugin.name)
    } catch (err) {
      // TODO : Use an alert to handle this error instead of a console.log
      console.log(`Cannot create Plugin : ${err.message}`)
      addToolTip(`Cannot create Plugin : ${err.message}`)
    }
  }

  render () {
    // Filtering helpers
    // const isFiltered = (profile) => (profile.displayName ? profile.displayName : profile.name).toLowerCase().includes(this.filter)
    // const isNotRequired = (profile) => !this.appManager.isRequired(profile.name)
    // const isNotDependent = (profile) => !this.appManager.isDependent(profile.name)
    // const isNotHome = (profile) => profile.name !== 'home'
    // const sortByName = (profileA, profileB) => {
    //   const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
    //   const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
    //   return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
    // }

    // const { actives, inactives } = this.appManager.getAll()
    //   .filter(isFiltered)
    //   .filter(isNotRequired)
    //   .filter(isNotDependent)
    //   .filter(isNotHome)
    //   .sort(sortByName)
    //   .reduce(({ actives, inactives }, profile) => {
    //     return this.isActive(profile.name)
    //       ? { actives: [...actives, profile], inactives }
    //       : { inactives: [...inactives, profile], actives }
    //   }, { actives: [], inactives: [] })
    // this.activePlugins = actives
    // this.inactivePlugins = inactives
    return this.htmlElement
  }

  // reRender () {
  //   if (this.views.root) {
  //     yo.update(this.views.root, this.render())
  //   }
  // }

  filterPlugins ({ target }) {
    this.filter = target.value.toLowerCase()
    this.renderComponent()
  }
}

module.exports = PluginManagerComponent
