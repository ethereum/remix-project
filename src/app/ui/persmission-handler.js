/* global localStorage */
const yo = require('yo-yo')
const csjs = require('csjs-inject')
const addTooltip = require('./tooltip')
const modalDialog = require('./modaldialog')
const globalRegistry = require('../../global/registry')

const css = csjs`
.permission h4 {
  text-transform: uppercase;
  text-align: center;
}
.permission h6 {
  text-transform: uppercase;
}
.remember {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.images {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
.images img {
  width: 40px;
  height: 40px;
}
.images i {
  margin: 0 20px;
}
`

function notAllowWarning (from, to) {
  return `${from.displayName || from.name} is not allowed to call ${to.displayName || to.name}.`
}

export class PermissionHandler {

  constructor () {
    this.permissions = this._getFromLocal()
  }

  _getFromLocal () {
    const permission = localStorage.getItem('plugins/permissions')
    return permission ? JSON.parse(permission) : {}
  }

  persistPermissions () {
    const permissions = JSON.stringify(this.permissions)
    localStorage.setItem('plugins/permissions', permissions)
  }

  clear () {
    localStorage.removeItem('plugins/permissions')
    addTooltip('All Permissions have been reset')
  }

  /**
   * Show a message to ask the user for a permission
   * @param {PluginProfile} from The name and hash of the plugin that make the call
   * @param {ModuleProfile} to The name of the plugin that receive the call
   * @returns {Promise<{ allow: boolean; remember: boolean }} Answer from the user to the permission
   */
  async openPermission (from, to) {
    return new Promise((resolve, reject) => {
      modalDialog(
        `Permission needed for ${to.displayName || to.name}`,
        this.form(from, to),
        {
          label: 'Accept',
          fn: () => {
            if (this.permissions[to.name][from.name]) {
              this.permissions[to.name][from.name] = {
                allow: true,
                hash: from.hash
              }
              this.persistPermissions()
            }
            resolve(true)
          }
        },
        {
          label: 'Decline',
          fn: () => {
            if (this.permissions[to.name][from.name]) {
              this.permissions[to.name][from.name] = {
                allow: false,
                hash: from.hash
              }
              this.persistPermissions()
            }
            reject(notAllowWarning(from, to))
          }
        }
      )
    })
  }

  /**
   * Check if a plugin has the permission to call another plugin and askPermission if needed
   * @param {PluginProfile} from the profile of the plugin that make the call
   * @param {ModuleProfile} to The profile of the module that receive the call
   * @returns {Promise<boolean>}
   */
  async askPermission (from, to) {
    try {
      this.permissions = this._getFromLocal()
      if (!this.permissions[to.name]) this.permissions[to.name] = {}
      if (!this.permissions[to.name][from.name]) return this.openPermission(from, to)

      const { allow, hash } = this.permissions[to.name][from.name]
      if (!allow) {
        const warning = notAllowWarning(from, to)
        addTooltip(warning)
        return false
      }
      return hash === from.hash
        ? true  // Allow
        : this.openPermission(from, to)  // New version of a plugin
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * The permission form
   * @param {PluginProfile} from The name and hash of the plugin that make the call
   * @param {ModuleProfile} to The name of the plugin that receive the call
   */
  form (from, to) {
    const fromName = from.displayName || from.name
    const toName = to.displayName || to.name
    const remember = this.permissions[to.name][from.name]

    const switchMode = (e) => {
      e.target.checked
        ? this.permissions[to.name][from.name] = {}
        : delete this.permissions[to.name][from.name]
    }
    const rememberSwitch = remember
      ? yo`<input type="checkbox" onchange="${switchMode}" checkbox class="form-check-input" id="remember" data-id="permissionHandlerRememberChecked">`
      : yo`<input type="checkbox" onchange="${switchMode}" class="form-check-input" id="remember" data-id="permissionHandlerRememberUnchecked">`
    const message = remember
      ? `"${fromName}" has changed and would like to access "${toName}"`
      : `"${fromName}" would like to access "${toName}"`

    const pluginsImages = yo`
      <article id="permissionModalImages" class="${css.images}">
        <img src="${from.icon}" />
        <i class="text-warning fas fa-arrow-right"></i>
        <img src="${to.icon}" />
      </article>

    `

    globalRegistry.get('themeModule').api.fixInvert(pluginsImages)

    return yo`
    <section class="${css.permission}">
      ${pluginsImages}
      <article>
        <h4 data-id="permissionHandlerMessage">${message} :</h4>
        <h6>${fromName}</h6>
        <p>${from.description || yo`<i>No description Provided</i>`}</p>
        <h6>${toName} :</p>
        <p>${to.description || yo`<i>No description Provided</i>`}</p>
      </article>

      <article class="${css.remember}">
        <div class="form-check">
          ${rememberSwitch}
          <label class="form-check-label" for="remember" data-id="permissionHandlerRememberChoice">Remember this choice</label>
        </div>
        <button class="btn btn-sm" onclick="${_ => this.clear()}">Reset all Permissions</button>
      </article>

    </section>
    `
  }

  listenOnThemeChange (images) {
    // update invert for Plugin icons
    if (!globalRegistry.get('themeModule')) return
    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
      globalRegistry.get('themeModule').api.fixInvert(images)
    })
  }
}
