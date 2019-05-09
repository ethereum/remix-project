import { EventEmitter } from 'events'
const registry = require('../../global/registry')
const csjs = require('csjs-inject')
const yo = require('yo-yo')

const css = csjs`
  .plugins        {
    height: 100%;
  }
  .plugItIn       {
    display        : none;
    height         : 100%;
  }
  .plugItIn > div {
    overflow-y     : auto;
    height         : 100%;
    width          : 100%;
  }
  .plugItIn.active     {
    display        : block;
  }
  .pluginsContainer {
    height: 100%;
    overflow-y: hidden;
  }
`

// Events are : 'toggle' | 'showing'

/** Abstract class used for hosting the view of a plugin */
export class AbstractPanel {

  constructor (panelName, appStore, opts) {
    this.events = new EventEmitter()
    this.contents = {}
    this.active = undefined

    // View where the plugin HTMLElement leaves
    this.view = yo`<div id="plugins" class="${css.plugins}"></div>`

    appStore.event.on('activate', (name) => {
      const api = appStore.getOne(name)
      const profile = api.profile
      if (profile.location !== panelName) return
      if (!profile.location && !opts.default) return
      if (profile.icon && api.render && typeof api.render === 'function') {
        this.add(name, api.render())
      }
    })

    appStore.event.on('deactivate', (name) => {
      if (this.contents[name]) this.remove(name)
    })

    const verticalIcon = registry.get('verticalicon').api
    // Toggle content
    verticalIcon.events.on('toggleContent', (name) => {
      if (!this.contents[name]) return
      if (this.active === name) {
        this.events.emit('toggle', name)
      }
      this.showContent(name)
      this.events.emit('showing', name)
    })
    // Force opening
    verticalIcon.events.on('showContent', (name) => {
      if (!this.contents[name]) return
      this.showContent(name)
      this.events.emit('showing', name)
    })
  }

  /**
   * Add the plugin to the panel
   * @param {String} name the name of the plugin
   * @param {HTMLElement} content the HTMLContent of the plugin
   */
  add (name, content) {
    if (this.contents[name]) throw new Error(`Plugin ${name} already rendered`)
    content.style.height = '100%'
    content.style.width = '100%'
    content.style.border = '0'
    this.contents[name] = yo`<div class="${css.plugItIn}" >${content}</div>`
    this.view.appendChild(this.contents[name])
  }

  /**
   * Remove a plugin from the panel
   * @param {String} name The name of the plugin to remove
   */
  remove (name) {
    const el = this.contents[name]
    delete this.contents[name]
    if (el) el.parentElement.removeChild(el)
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
    this.contents[name].style.display = 'block'
    this.active = name
  }
}

