// eslint-disable-next-line no-use-before-define
import React from 'react'
import ReactDOM from 'react-dom'
import Registry from '../state/registry'
import packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { IconRecord, RemixUiVerticalIconsPanel } from '@remix-ui/vertical-icons-panel'
import { Profile } from '@remixproject/plugin-utils'
import { timeStamp } from 'console'

const profile = {
  name: 'menuicons',
  displayName: 'Vertical Icons',
  description: '',
  version: packageJson.version,
  methods: ['select', 'unlinkContent', 'linkContent'],
  events: ['toggleContent', 'showContent']
}

export class VerticalIcons extends Plugin {
  events: EventEmitter
  htmlElement: HTMLDivElement
  icons: Record<string, IconRecord> = {}
  constructor () {
    super(profile)
    this.events = new EventEmitter()
    this.htmlElement = document.createElement('div')
    this.htmlElement.setAttribute('id', 'icon-panel')
  }

  renderComponent () {
    const fixedOrder = ['filePanel', 'solidity','udapp', 'debugger', 'solidityStaticAnalysis', 'solidityUnitTesting', 'pluginManager']

    const divived = Object.values(this.icons).map((value) => { return {
      ...value,
      isRequired: fixedOrder.indexOf(value.profile.name) > -1
    }}).sort((a,b) => {
      return a.timestamp - b.timestamp
    })

    const required = divived.filter((value) => value.isRequired).sort((a,b) => {
      return fixedOrder.indexOf(a.profile.name) - fixedOrder.indexOf(b.profile.name)
    })

    const sorted: IconRecord[] = [
      ...required,
      ...divived.filter((value) => { return !value.isRequired })
    ]

    ReactDOM.render(
      <RemixUiVerticalIconsPanel
        verticalIconsPlugin={this}
        icons={sorted}
      />,
      this.htmlElement)
  }

  onActivation () {
    this.renderComponent()
    this.on('sidePanel', 'focusChanged', (name: string) => {
      Object.keys(this.icons).map((o) => {
        this.icons[o].active = false
      })
      this.icons[name].active = true
      this.renderComponent()
    })
  }

  async linkContent (profile: Profile) {
    if (!profile.icon) return
    if (!profile.kind) profile.kind = 'none'
    this.icons[profile.name] = {
      profile: profile,
      active: false,
      canbeDeactivated: await this.call('manager', 'canDeactivate', this.profile, profile),
      timestamp: Date.now()
    }
    this.renderComponent()
  }

  unlinkContent (profile: Profile) {
    delete this.icons[profile.name]
    this.renderComponent()
  }

  async activateHome() {
    await this.call('manager', 'activatePlugin', 'home')
    await this.call('tabs', 'focus', 'home')
  }

  /**
   * Set an icon as active
   * @param {string} name Name of profile of the module to activate
   */
  select (name: string) {
    // TODO: Only keep `this.emit` (issue#2210)
    console.log(name, this)
    this.emit('showContent', name)
    this.events.emit('showContent', name)
  }

  /**
   * Toggles the side panel for plugin
   * @param {string} name Name of profile of the module to activate
   */
  toggle (name: string) {
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('toggleContent', name)
    this.events.emit('toggleContent', name)
  }

  render () {
    return this.htmlElement
  }
}
