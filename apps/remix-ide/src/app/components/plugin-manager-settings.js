const yo = require('yo-yo')
const csjs = require('csjs-inject')
const modalDialog = require('../ui/modaldialog')

const css = csjs`
.remixui_permissions {
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
  constructor () {
    const fromLocal = window.localStorage.getItem('plugins/permissions')
    this.permissions = JSON.parse(fromLocal || '{}')
  }

  openDialog () {
    this.currentSetting = this.settings()
    modalDialog('Plugin Manager Permissions', this.currentSetting,
      { fn: () => this.onValidation() }
    )
  }

  onValidation () {
    const permissions = JSON.stringify(this.permissions)
    window.localStorage.setItem('plugins/permissions', permissions)
  }

  /** Clear one permission from a plugin */
  clearPersmission (from, to, method) {
    // eslint-disable-next-line no-debugger
    debugger
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
    // eslint-disable-next-line no-debugger
    debugger
    if (!this.permissions[to]) return
    delete this.permissions[to]
    yo.update(this.currentSetting, this.settings())
  }


  render () {
    return yo`
    <footer class="bg-light ${css.permissions} remix-bg-opacity">
      <button onclick="${() => this.openDialog()}" class="btn btn-primary settings-button" data-id="pluginManagerPermissionsButton">Permissions</button>
    </footer>`
  }
}
