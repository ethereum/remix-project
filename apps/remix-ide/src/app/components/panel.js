import React from 'react' // eslint-disable-line
import { EventEmitter } from 'events'
const EventManager = require('../../lib/events')
import { HostPlugin } from '@remixproject/engine-web' // eslint-disable-line

/** Abstract class used for hosting the view of a plugin */
export class AbstractPanel extends HostPlugin {
  constructor (profile) {
    super(profile)
    this.events = new EventEmitter()
    this.event = new EventManager()
    this.contents = {}
    this.active = undefined
  }

  addView (profile, view) {
    console.log(profile, view)
    if (this.contents[profile.name]) throw new Error(`Plugin ${profile.name} already rendered`)
    this.contents[profile.name] = view
    //this.contents[profile.name].style.display = 'none'
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
    const el = this.contents[name]
    delete this.contents[name]
    if (name === this.active) this.active = undefined
  }

  /**
   * Display the content of this specific plugin
   * @param {String} name The name of the plugin to display the content
   */
  showContent (name) {
    if (!this.contents[name]) throw new Error(`Plugin ${name} is not yet activated`)
    // hiding the current view and display the `moduleName`
    if (this.active) {
      this.contents[this.active].style.display = 'none'
    }
    this.contents[name].style.display = 'flex'
    this.contents[name].style.paddingTop = '20%'
    this.contents[name].style.flexDirection = 'column'

    this.active = name
  }

  focus (name) {
    this.showContent(name)
  }
}
