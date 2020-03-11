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
}
`

export class PluginManagerSettings {

  openDialog () {
    const fromLocal = window.localStorage.getItem('plugins/permissions')
    this.permissions = JSON.parse(fromLocal || '{}')
    this.currentSetting = this.settings()
    modalDialog('Plugin Manager Permissions', this.currentSetting,
      { fn: () => this.onValidation() },
    )
  }

  onValidation () {
    const permissions = JSON.stringify(this.permissions)
    window.localStorage.setItem('plugins/permissions', permissions)
  }

  /** Clear one permission from a plugin */
  clearPersmission (from, to, method) {
    if (this.permissions[to] && this.permissions[to][method]) {
      delete this.permissions[to][method][from]
      if (Object.keys(this.permissions[to][method]).length === 0) {
        delete this.permissions[to][method]
      }
      if (Object.keys(this.permissions[to]).length === 0) {
        delete this.permissions[to]
      }
      yo.update(this.currentSetting, this.settings())
    }
  }

  /** Clear all persmissions from a plugin */
  clearAllPersmission (to) {
    if (!this.permissions[to]) return
    delete this.permissions[to]
    yo.update(this.currentSetting, this.settings())
  }

  settings () {
    const permissionByToPlugin = (toPlugin, funcObj) => {
      const permissionByFunctions = (funcName, fromPlugins) => {
        function updatePermission (plugin) {
          self.permissions[toPlugin][funcName][plugin].allow = !self.permissions[toPlugin][funcName][plugin].allow
        }
        let self = this
        return Object.keys(fromPlugins).map(fromName => {
          const fromPluginPermission = fromPlugins[fromName]
          const checkbox = fromPluginPermission.allow
            ? yo`<input onchange=${() => updatePermission(fromName)} class="mr-2" type="checkbox" checked id="permission-checkbox-${toPlugin}-${funcName}-${toPlugin}" aria-describedby="module ${fromPluginPermission} ask permission for ${funcName}" />`
            : yo`<input onchange=${() => updatePermission(fromName)} class="mr-2" type="checkbox" id="permission-checkbox-${toPlugin}-${funcName}-${toPlugin}" aria-describedby="module ${fromPluginPermission} ask permission for ${funcName}" />`
          return yo`
            <div class="form-group ${css.permissionKey}">
              <div class="${css.checkbox}">
                ${checkbox}
                <label for="permission-checkbox-${toPlugin}-${funcName}-${toPlugin}" data-id="permission-label-${toPlugin}-${funcName}-${toPlugin}">Allow <u>${fromName}</u> to call <u>${funcName}</u></label>
              </div>
              <i onclick="${() => this.clearPersmission(fromName, toPlugin, funcName)}" class="fa fa-trash-alt" data-id="pluginManagerSettingsRemovePermission-${toPlugin}-${funcName}-${toPlugin}"></i>
            </div>
          `
        })
      }

      const permissionsByFunctions = Object
        .keys(funcObj)
        .map(funcName => permissionByFunctions(funcName, funcObj[funcName]))

      return yo`
      <div border p-2>
        <div class="pb-2 ${css.permissionKey}">
          <h3>${toPlugin} permissions:</h3>
          <i onclick="${() => this.clearAllPersmission(toPlugin)}" class="far fa-trash-alt" data-id="pluginManagerSettingsClearAllPermission-${toPlugin}"></i>
        </div>
        ${permissionsByFunctions}
      </div>`
    }

    const byToPlugin = Object
      .keys(this.permissions)
      .map(toPlugin => permissionByToPlugin(toPlugin, this.permissions[toPlugin]))

    const title = byToPlugin.length === 0
      ? yo`<h4>No Permission requested yet.</h4>`
      : yo`<h4>Current Permission settings</h4>`

    return yo`<form class="${css.permissionForm}" data-id="pluginManagerSettingsPermissionForm">
      ${title}
      <hr/>
      ${byToPlugin}
    </form>`
  }

  render () {
    return yo`
    <footer class="bg-light ${css.permissions} remix-bg-opacity">
      <button onclick="${() => this.openDialog()}" class="btn btn-primary settings-button" data-id="pluginManagerPermissionsButton">Permissions</button>
    </footer>`
  }

}
