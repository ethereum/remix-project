/* global localStorage */
const yo = require('yo-yo')
const modalDialog = require('../ui/modaldialog')

const unexposedEvents = ['statusChanged']

module.exports = class LocalPlugin {

  /**
   * Open a modal to create a local plugin
   * @param {PluginApi[]} plugins The list of the plugins in the store
   * @returns {Promise<{api: any, profile: any}>} A promise with the new plugin profile
   */
  open (plugins) {
    this.profile = JSON.parse(localStorage.getItem('plugins/local')) || { notifications: {} }
    return new Promise((resolve, reject) => {
      const onValidation = () => {
        try {
          const profile = this.create()
          resolve(profile)
        } catch (err) {
          reject(err)
        }
      }
      modalDialog('Local Plugin', this.form(plugins),
        { fn: () => onValidation() },
        { fn: () => resolve() }
      )
    })
  }

  /**
   * Create the object to add to the plugin-list
   */
  create () {
    const profile = {
      ...this.profile,
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMjYyIDEwNzVxLTM3IDEyMS0xMzggMTk1dC0yMjggNzQtMjI4LTc0LTEzOC0xOTVxLTgtMjUgNC00OC41dDM4LTMxLjVxMjUtOCA0OC41IDR0MzEuNSAzOHEyNSA4MCA5Mi41IDEyOS41dDE1MS41IDQ5LjUgMTUxLjUtNDkuNSA5Mi41LTEyOS41cTgtMjYgMzItMzh0NDktNCAzNyAzMS41IDQgNDguNXptLTQ5NC00MzVxMCA1My0zNy41IDkwLjV0LTkwLjUgMzcuNS05MC41LTM3LjUtMzcuNS05MC41IDM3LjUtOTAuNSA5MC41LTM3LjUgOTAuNSAzNy41IDM3LjUgOTAuNXptNTEyIDBxMCA1My0zNy41IDkwLjV0LTkwLjUgMzcuNS05MC41LTM3LjUtMzcuNS05MC41IDM3LjUtOTAuNSA5MC41LTM3LjUgOTAuNSAzNy41IDM3LjUgOTAuNXptMjU2IDI1NnEwLTEzMC01MS0yNDguNXQtMTM2LjUtMjA0LTIwNC0xMzYuNS0yNDguNS01MS0yNDguNSA1MS0yMDQgMTM2LjUtMTM2LjUgMjA0LTUxIDI0OC41IDUxIDI0OC41IDEzNi41IDIwNCAyMDQgMTM2LjUgMjQ4LjUgNTEgMjQ4LjUtNTEgMjA0LTEzNi41IDEzNi41LTIwNCA1MS0yNDguNXptMTI4IDBxMCAyMDktMTAzIDM4NS41dC0yNzkuNSAyNzkuNS0zODUuNSAxMDMtMzg1LjUtMTAzLTI3OS41LTI3OS41LTEwMy0zODUuNSAxMDMtMzg1LjUgMjc5LjUtMjc5LjUgMzg1LjUtMTAzIDM4NS41IDEwMyAyNzkuNSAyNzkuNSAxMDMgMzg1LjV6Ii8+PC9zdmc+',
      methods: [],
      hash: `local-${this.profile.name}`,
      location: 'swapPanel'
    }
    profile.events = profile.events.filter((item) => { return item !== '' })
    if (!profile.name) throw new Error('Plugin should have a name')
    if (!profile.url) throw new Error('Plugin should have an URL')
    localStorage.setItem('plugins/local', JSON.stringify(profile))
    return profile
  }

  /**
   * Add or remove a notification to/from the profile
   * @param {Event} e The event when checkbox changes
   * @param {string} pluginName The name of the plugin
   * @param {string} eventName The name of the event to listen on
   */
  toggleNotification (e, pluginName, eventName) {
    const {checked} = e.target
    if (checked) {
      if (!this.profile.notifications[pluginName]) this.profile.notifications[pluginName] = []
      this.profile.notifications[pluginName].push(eventName)
    } else {
      this.profile.notifications[pluginName].splice(this.profile.notifications[pluginName].indexOf(eventName), 1)
      if (this.profile.notifications[pluginName].length === 0) delete this.profile.notifications[pluginName]
    }
  }

  updateName ({target}) {
    this.profile.name = target.value
  }

  updateUrl ({target}) {
    this.profile.url = target.value
  }

  updateDisplayName ({target}) {
    this.profile.displayName = target.value
  }

  updateEvents ({target}, index) {
    if (this.profile.events[index] !== undefined) {
      this.profile.events[index] = target.value
    }
  }

  /**
   * The checkbox for a couple module / event
   * @param {string} plugin The name of the plugin
   * @param {string} event The name of the event exposed by the plugin
   */
  notificationCheckbox (plugin, event) {
    const notifications = this.profile.notifications || {}
    const checkbox = notifications[plugin] && notifications[plugin].includes(event)
      ? yo`<input type="checkbox" checked onchange="${e => this.toggleNotification(e, plugin, event)}">`
      : yo`<input type="checkbox" onchange="${e => this.toggleNotification(e, plugin, event)}">`
    return yo`<div>
      ${checkbox}
      <label>${plugin} - ${event}</label>
    </div>`
  }

  /**
   * The form to create a local plugin
   * @param {ProfileApi[]} plugins Liste of profile of the plugins
   */
  form (plugins = []) {
    const name = this.profile.name || ''
    const url = this.profile.url || ''
    const displayName = this.profile.displayName || ''
    const profiles = plugins
      .filter(({profile}) => profile.events && profile.events.length > 0)
      .map(({profile}) => profile)

    const eventsForm = (events) => {
      return yo`<div>${events.map((event, i) => {
        return yo`<input class="form-control" onchange="${e => this.updateEvents(e, i)}" value="${event}" />`
      })}</div>`
    }
    const eventsEl = eventsForm(this.profile.events || [])
    const pushEvent = () => {
      if (!this.profile.events) this.profile.events = []
      this.profile.events.push('')
      yo.update(eventsEl, eventsForm(this.profile.events))
    }
    const addEvent = yo`<button type="button" class="btn btn-sm btn-light" onclick="${() => pushEvent()}">Add an event</button>`

    return yo`
    <form id="local-plugin-form">
      <div class="form-group">
        <label for="plugin-name">Plugin Name <small>(required)</small></label>
        <input class="form-control" onchange="${e => this.updateName(e)}" value="${name}" id="plugin-name" placeholder="Should be camelCase">
      </div>
      <div class="form-group">
        <label for="plugin-displayname">Display Name</label>
        <input class="form-control" onchange="${e => this.updateDisplayName(e)}" value="${displayName}" id="plugin-displayname" placeholder="Name in the header">
      </div>
      <div class="form-group">
        <label for="plugin-url">Url <small>(required)</small></label>
        <input class="form-control" onchange="${e => this.updateUrl(e)}" value="${url}" id="plugin-url" placeholder="ex: https://localhost:8000">
      </div>
      <div class="form-group">
        <label>Events</label>
        ${eventsEl}${addEvent}
      </div>
      <div class="form-group">
        <label>Notifications</label>
        ${profiles.map(({name, events}) => {
          return events
            .filter(event => !unexposedEvents.includes(event))
            .map(event => this.notificationCheckbox(name, event))
        })}
      </div>
    </form>`
  }
}

