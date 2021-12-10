import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { RemixUiAbstractPanel } from '@remix-ui/abstract-panel' // eslint-disable-line
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
    this.element = document.createElement('div')
  }

  onActivation () {
    this.renderComponent()
  }

  addView (profile, view) {
    if (this.contents[profile.name]) throw new Error(`Plugin ${profile.name} already rendered`)
    view.style.border = '0'
    this.contents[profile.name] = view
    this.contents[profile.name].style.display = 'none'
    this.element.appendChild(this.contents[profile.name])
    this.renderComponent()
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
    if (el) el.parentElement.removeChild(el)
    if (name === this.active) this.active = undefined
    this.renderComponent()
  }

  /**
   * Display the content of this specific plugin
   * @param {String} name The name of the plugin to display the content
   */
  showContent (name) {
    if (!this.contents[name]) throw new Error(`Plugin ${name} is not yet activated`)
    // hiding the current view and display the `moduleName`
    if (this.active) {
      console.log({ active: this.active, name }, 'first')
      this.contents[this.active].style.display = 'none'
    }
    console.log({ active: this.active, name }, 'second')
    this.contents[name].style.display = 'flex'
    this.active = name
    this.renderComponent()
  }

  focus (name) {
    this.showContent(name)
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiAbstractPanel
        plugin={this}
      />,
      this.element
    )
  }
}
