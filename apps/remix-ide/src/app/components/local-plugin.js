/* global localStorage */
const yo = require('yo-yo')
const modalDialog = require('../ui/modaldialog')

const defaultProfile = {
  methods: [],
  location: 'sidePanel',
  type: 'iframe'
}

module.exports = class LocalPlugin {
  /**
   * Open a modal to create a local plugin
   * @param {Profile[]} plugins The list of the plugins in the store
   * @returns {Promise<{api: any, profile: any}>} A promise with the new plugin profile
   */
  open (plugins) {
    this.profile = JSON.parse(localStorage.getItem('plugins/local')) || defaultProfile
    return new Promise((resolve, reject) => {
      const onValidation = () => {
        try {
          const profile = this.create()
          resolve(profile)
        } catch (err) {
          reject(err)
        }
      }
      modalDialog('Local Plugin', this.form(),
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
      icon: 'assets/img/localPlugin.webp',
      methods: [],
      location: 'sidePanel',
      type: 'iframe',
      ...this.profile,
      hash: `local-${this.profile.name}`
    }
    if (!profile.location) throw new Error('Plugin should have a location')
    if (!profile.name) throw new Error('Plugin should have a name')
    if (!profile.url) throw new Error('Plugin should have an URL')
    localStorage.setItem('plugins/local', JSON.stringify(profile))
    return profile
  }

  updateName ({ target }) {
    this.profile.name = target.value
  }

  updateUrl ({ target }) {
    this.profile.url = target.value
  }

  updateDisplayName ({ target }) {
    this.profile.displayName = target.value
  }

  updateProfile (key, e) {
    this.profile[key] = e.target.value
  }

  updateMethods ({ target }) {
    if (target.value) {
      try {
        this.profile.methods = target.value.split(',')
      } catch (e) {}
    }
  }

  /** The form to create a local plugin */
  form () {
    const name = this.profile.name || ''
    const url = this.profile.url || ''
    const displayName = this.profile.displayName || ''
    const methods = (this.profile.methods && this.profile.methods.join(',')) || ''
    const radioSelection = (key, label, message) => {
      return this.profile[key] === label
        ? yo`<div class="radio">
          <input class="form-check-input" type="radio" name="${key}" onclick="${e => this.updateProfile(key, e)}" value="${label}" id="${label}" data-id="localPluginRadioButton${label}" checked="checked" />
          <label class="form-check-label" for="${label}">${message}</label>
        </div>`
        : yo`<div class="radio">
          <input class="form-check-input" type="radio" name="${key}" onclick="${e => this.updateProfile(key, e)}" value="${label}" id="${label}" data-id="localPluginRadioButton${label}" />
          <label class="form-check-label" for="${label}">${message}</label>
        </div>`
    }

    return yo`
    <form id="local-plugin-form">
      <div class="form-group">
        <label for="plugin-name">Plugin Name <small>(required)</small></label>
        <input class="form-control" onchange="${e => this.updateName(e)}" value="${name}" id="plugin-name" data-id="localPluginName" placeholder="Should be camelCase">
      </div>
      <div class="form-group">
        <label for="plugin-displayname">Display Name</label>
        <input class="form-control" onchange="${e => this.updateDisplayName(e)}" value="${displayName}" id="plugin-displayname" data-id="localPluginDisplayName" placeholder="Name in the header">
      </div>

      <div class="form-group">
        <label for="plugin-methods">Api (comma separated list of methods name)</label>
        <input class="form-control" onchange="${e => this.updateMethods(e)}" value="${methods}" id="plugin-methods" data-id="localPluginMethods" placeholder="Name in the header">
      </div>

      <div class="form-group">
        <label for="plugin-url">Url <small>(required)</small></label>
        <input class="form-control" onchange="${e => this.updateUrl(e)}" value="${url}" id="plugin-url" data-id="localPluginUrl" placeholder="ex: https://localhost:8000">
      </div>
      <h6>Type of connection <small>(required)</small></h6>
      <div class="form-check form-group">
        ${radioSelection('type', 'iframe', 'Iframe')}
        ${radioSelection('type', 'ws', 'Websocket')}
      </div>
      <h6>Location in remix <small>(required)</small></h6>
      <div class="form-check form-group">
        ${radioSelection('location', 'sidePanel', 'Side Panel')}
        ${radioSelection('location', 'mainPanel', 'Main Panel')}
        ${radioSelection('location', 'none', 'None')}
      </div>
    </form>`
  }
}
