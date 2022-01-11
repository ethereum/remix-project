/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useState } from 'react' // eslint-disable-line no-use-before-define
/* eslint-disable-line */
import { ModalDialog } from '@remix-ui/modal-dialog'
import useLocalStorage from '../custom-hooks/useLocalStorage'
import { PluginPermissions } from '../../types'

function PermisssionsSettings () {
  const [modalVisibility, setModalVisibility] = useState<boolean>(true)
  const [permissions, setPermissions] = useLocalStorage<PluginPermissions>('plugins/permissions', {} as PluginPermissions)
  const [permissionCache, setpermissionCache] = useState<PluginPermissions>()
  const closeModal = () => setModalVisibility(true)
  const openModal = () => {
    const currentValue = JSON.parse(window.localStorage.getItem('plugins/permissions') || '{}')
    setpermissionCache(currentValue)
    setPermissions(currentValue)
    setModalVisibility(!modalVisibility)
  }

  const cancel = () => {
    setPermissions(permissionCache)
  }

  const getState = (targetPlugin:string, funcName:string, pluginName :string) => {
    return permissions[targetPlugin][funcName][pluginName].allow
  }

  const handleCheckboxClick = (targetPlugin:string, funcName:string, pluginName :string) => {
    setPermissions((permissions) => {
      permissions[targetPlugin][funcName][pluginName].allow = !permissions[targetPlugin][funcName][pluginName].allow
      return permissions
    })
  }

  function clearFunctionPermission (targetPlugin:string, funcName:string, pluginName :string) {
    setPermissions((permissions) => {
      delete permissions[targetPlugin][funcName][pluginName]
      if (Object.keys(permissions[targetPlugin][funcName]).length === 0) delete permissions[targetPlugin][funcName]
      if (Object.keys(permissions[targetPlugin]).length === 0) delete permissions[targetPlugin]
      return permissions
    })
  }

  function clearTargetPermission (targetPlugin: string) {
    setPermissions((permissions) => {
      delete permissions[targetPlugin]
      return permissions
    })
  }

  function RenderPluginHeader ({ headingName }) {
    return (
      <div className="pb-2 remixui_permissionKey">
        <h3>{headingName} permissions:</h3>
        <i
          onClick={() => {
            clearTargetPermission(headingName)
          }}
          className="far fa-trash-alt"
          data-id={`pluginManagerSettingsClearAllPermission-${headingName}`}>

        </i>
      </div>
    )
  }

  function RenderPermissions ({ targetPlugin }) {
    return <>{Object.keys(permissions[targetPlugin]).map(funcName => {
      return Object.keys(permissions[targetPlugin][funcName]).map((pluginName, index) => (
        <div className="form-group remixui_permissionKey" key={pluginName}>
          { permissions && Object.keys(permissions).length > 0
            ? (
              <><div className="remixui_checkbox">
                <span className="mr-2">
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxClick(targetPlugin, funcName, pluginName)}
                    checked={getState(targetPlugin, funcName, pluginName)}
                    id={`permission-checkbox-${targetPlugin}-${funcName}-${pluginName}`}
                    aria-describedby={`module ${pluginName} asks permission for ${funcName}`} />
                  <label
                    className="ml-4"
                    htmlFor={`permission-checkbox-${targetPlugin}-${funcName}-${targetPlugin}`}
                    data-id={`permission-label-${targetPlugin}-${funcName}-${targetPlugin}`}
                  >
                    Allow <u>{pluginName}</u> to call <u>{funcName}</u>
                  </label>
                </span>
              </div><i
                onClick={() => {
                  clearFunctionPermission(targetPlugin, funcName, pluginName)
                } }
                className="fa fa-trash-alt"
                data-id={`pluginManagerSettingsRemovePermission-${targetPlugin}-${funcName}-${targetPlugin}`} /></>
            ) : null
          }
        </div>
      ))
    })}</>
  }

  return (
    <Fragment>
      <ModalDialog
        id='permissionsSettings'
        handleHide={closeModal}
        cancelFn={cancel}
        hide={modalVisibility}
        title="Plugin Manager Permissions"
        okLabel="OK"
        cancelLabel="Cancel"
      >
        {permissions && Object.keys(permissions).length > 0
          ? (<h4 className="text-center">Current Permission Settings</h4>)
          : (<h4 className="text-center">No Permission requested yet.</h4>)
        }
        <form className="remixui_permissionForm" data-id="pluginManagerSettingsPermissionForm">
          <div className="p-2">
            {
              Object.keys(permissions).map(targetPlugin => (
                <div key={`container-${targetPlugin}`}>
                  <RenderPluginHeader key={`header-${targetPlugin}`} headingName={targetPlugin} />
                  <RenderPermissions key={`permissions-${targetPlugin}`} targetPlugin={targetPlugin}/>
                </div>
              ))
            }
          </div>
        </form>
      </ModalDialog>
      <footer className="bg-light remixui_permissions remix-bg-opacity">
        <button
          onClick={openModal}
          className="btn btn-primary settings-button"
          data-id="pluginManagerPermissionsButton">
          Permissions
        </button>
      </footer>
    </Fragment>
  )
}
export default PermisssionsSettings
