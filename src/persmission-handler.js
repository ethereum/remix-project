/* global localStorage */
const yo = require('yo-yo')
const csjs = require('csjs-inject')
const addTooltip = require('./app/ui/tooltip')
const modalDialog = require('./app/ui/modaldialog')

const css = csjs`
.permission h4 {
  text-align: center;
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
.images span {
  marign: 0 20px;
}
`

function notAllowWarning(from, to) {
  return `${from.displayName || from.name} is not allowed to call ${to.displayName || to.name}.`
}

export class PermissionHandler {

  constructor () {
    const permission = localStorage.getItem('plugins/permissions')
    this.permissions = permission ? JSON.parse(permission) : {}
  }

  persistPermissions () {
    const permissions = JSON.stringify(this.permissions)
    localStorage.setItem('plugins/permissions', permissions)
  }

  clear () {
    localStorage.removeItem('plugins/permissions')
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
              this.permissions[to.name][from.name].allow = true
              this.persistPermissions()
            }
            resolve()
          }
        },
        {
          label: 'Decline',
          fn: () => {
            if (this.permissions[to.name][from.name]) {
              this.permissions[to.name][from.name].allow = false
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
    if (!this.permissions[to.name]) this.permissions[to.name] = {}
    if (!this.permissions[to.name][from.name]) return this.openPermission(from, to)

    const { allow, hash } = this.permissions[to.name][from.name]
    if (!allow) {
      const warning = notAllowWarning(from, to)
      addTooltip(warning)
      throw new Error(warning)
    }
    return hash === from.hash
      ? true  // Allow
      : this.openPermission(from, to)  // New version of a plugin
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
      ? yo`<input type="checkbox" onchange="${switchMode}" checkbox class="custom-control-input" id="remember">`
      : yo`<input type="checkbox" onchange="${switchMode}" class="custom-control-input" id="remember">`
    const message = remember
      ? `${fromName} has changed and would like to access the plugin ${toName}.`
      : `${fromName} would like to access plugin ${toName}.`

    return yo`
    <section class="${css.permission}">
      <article class="${css.images}">
        <img src="${from.icon}" />
        <span>  --->  </span>
        <img src="${to.icon}" />
      </article>
      <h4>${message}</h4>
      <div class="custom-control custom-checkbox">
        ${rememberSwitch}
        <label class="custom-control-label" for="remember">Remember this choice</label>
      </div>
    </section>
    `
  }
}
