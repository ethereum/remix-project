const yo = require('yo-yo')
const csjs = require('csjs-inject')
const modalDialog = require('../ui/modaldialog')

const css = csjs` 
.permissions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 20px;
}
.permissions button {
  padding: 2px 5px;
  cursor: pointer;
}
.permissionForm h4 {
  font-size: 1.3rem;
  text-align: center;
}
.permissionForm h6 {
  font-size: 1.1rem;
}
.permissionForm hr {
  width: 80%;
}
.permissionKey {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.permissionKey i {
  cursor: pointer;
}
.checkbox {
  display: flex;
  align-items: center;
}
.checkbox label {
  margin: 0;
  font-size: 1rem;
}`

export class PluginManagerSettings {

  openDialog () {
    const fromLocal = window.localStorage.getItem('plugins/permissions')
    this.permissions = JSON.parse(fromLocal || '{}')
    this.currentSetting = this.settings()
    modalDialog('Plugin Manager Settings', this.currentSetting,
      { fn: () => this.onValidation() },
    )
  }

  onValidation () {
    const permissions = JSON.stringify(this.permissions)
    window.localStorage.setItem('plugins/permissions', permissions)
  }

  /** Clear one permission from a plugin */
  clearPersmission (from, to) {
    if (!this.permissions[from]) return
    delete this.permissions[from][to]
    if (Object.keys(this.permissions[from]).length === 0) {
      delete this.permissions[from]
    }
    yo.update(this.currentSetting, this.settings())
  }

  /** Clear all persmissions from a plugin */
  clearAllPersmission (from) {
    if (!this.permissions[from]) return
    delete this.permissions[from]
    yo.update(this.currentSetting, this.settings())
  }

  settings () {
    const permissionByModule = (key, permission) => {
      const permissionByPlugin = (name, plugin) => {
        function updatePermission () {
          plugin.allow = !plugin.allow
        }
        const checkbox = plugin.allow
          ? yo`<input onchange="${updatePermission}" type="checkbox" checked id="permission-${name}" aria-describedby="module ${key} ask permission for ${name}" />`
          : yo`<input onchange="${updatePermission}" type="checkbox" id="permission-${name}" aria-describedby="module ${key} ask permission for ${name}" />`

        return yo`
        <div class="form-group ${css.permissionKey}">
          <div class="${css.checkbox}">
            ${checkbox}
            <label for="permission-${name}" data-id="pluginManagerSettingsPermission${name}">Allow plugin ${name} to write on ${key}</label>
          </div>
          <i onclick="${() => this.clearPersmission(key, name)}" class="fa fa-trash-alt" data-id="pluginManagerSettingsRemovePermission${name}"></i>
        </div>`
      }

      const byModule = Object
        .keys(permission)
        .map(name => permissionByPlugin(name, permission[name]))

      return yo`
      <div>
        <div class="${css.permissionKey}">
          <h6>${key} :</h6>
          <i onclick="${() => this.clearAllPersmission(key)}" class="far fa-trash-alt" data-id="pluginManagerSettingsClearAllPermission"></i>
        </div>
        ${byModule}
      </div>`
    }

    const permissions = Object
      .keys(this.permissions)
      .map(key => permissionByModule(key, this.permissions[key]))

    const title = permissions.length === 0
      ? yo`<h4>No Permission requested yet.</h4>`
      : yo`<h4>Current Permission settings</h4>`

    return yo`<form class="${css.permissionForm}" data-id="pluginManagerSettingsPermissionForm">
      ${title}
      <hr/>
      ${permissions}
    </form>`
  }

  render () {
    return yo`
    <footer class="bg-light ${css.permissions} remix-bg-opacity">
      <button onclick="${() => this.openDialog()}" class="btn btn-primary settings-button" data-id="pluginManagerSettingsButton">Settings</button>
    </footer>`
  }

}
