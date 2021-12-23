import React from 'react' // eslint-disable-line
import { EventEmitter } from 'events'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import { HostPlugin } from '@remixproject/engine-web' // eslint-disable-line

import { Profile } from '@remixproject/plugin-utils'
const EventManager = require('../../lib/events')

/** Abstract class used for hosting the view of a plugin */
type PluginRecord = {
  profile: Profile
  view: any
  active: boolean
}
export class AbstractPanel extends HostPlugin {

  events: EventEmitter
  event: any
  verticalIcons: VerticalIcons
  public plugins: Record<string, PluginRecord> = {}
  constructor (profile) {
    super(profile)
    this.events = new EventEmitter()
    this.event = new EventManager()
  }

  currentFocus (): string {
    return Object.values(this.plugins).find(plugin => {
      return plugin.active
    }).profile.name
  }

  addView (profile, view) {
    console.log(profile, view)
    if (this.plugins[profile.name]) throw new Error(`Plugin ${profile.name} already rendered`)
    this.plugins[profile.name] = {
      profile: profile,
      view: view,
      active: false
    }
    console.log(this.plugins)
  }

  removeView (profile) {
    this.emit('pluginDisabled', profile.name)
    this.verticalIcons.unlinkContent(profile)
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
    // hiding the current view and display the `moduleName`
    /*
    if (this.active) {
      this.contents[this.active].style.display = 'none'
    }
    this.contents[name].style.display = 'flex'
    this.contents[name].style.paddingTop = '20%'
    this.contents[name].style.flexDirection = 'column'
    */
    Object.values(this.plugins).forEach(plugin => {
      plugin.active = false
    })
    this.plugins[name].active = true
    console.log(this.plugins)
  }

  focus (name) {
    this.showContent(name)
  }
}
