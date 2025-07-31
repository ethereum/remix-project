import React from 'react' // eslint-disable-line
import { EventEmitter } from 'events'
import { HostPlugin } from '@remixproject/engine-web' // eslint-disable-line
import { PluginRecord } from '@remix-ui/panel'
import EventManager from '../../lib/events'

export class AbstractPanel extends HostPlugin {
  events: EventEmitter
  event: any
  public plugins: Record<string, PluginRecord> = {}
  constructor (profile) {
    super(profile)
    this.events = new EventEmitter()
    this.event = new EventManager()
  }

  currentFocus (): string {
    const activePlugin = Object.values(this.plugins).find(plugin => {
      return plugin.active
    })

    return activePlugin ? activePlugin.profile.name : null
  }

  addView (profile, view) {
    if (this.plugins[profile.name]) throw new Error(`Plugin ${profile.name} already rendered`)
    this.plugins[profile.name] = {
      profile: profile,
      view: view,
      active: false,
      pinned: false,
      class: 'plugItIn active ' + (profile.location === "sidePanel" ? 'pb-0' : ''),
    }
  }

  removeView (profile) {
    this.emit('pluginDisabled', profile.name)
    this.call('menuicons', 'unlinkContent', profile)
    this.remove(profile.name)
  }

  /**
   * Remove a plugin from the panel
   * @param {String} name The name of the plugin to remove
   */
  remove (name) {
    delete this.plugins[name]
  }

  /**
   * Display the content of this specific plugin
   * @param {String} name The name of the plugin to display the content
   */
  showContent (name) {
    if (!this.plugins[name]) throw new Error(`Plugin ${name} is not yet activated`)
    Object.values(this.plugins).forEach(plugin => {
      plugin.active = false
    })
    this.plugins[name].active = true
  }

  focus (name) {
    this.showContent(name)
  }
}
