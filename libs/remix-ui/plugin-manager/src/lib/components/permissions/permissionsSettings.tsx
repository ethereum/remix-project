import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { PluginManagerSettings, PluginPermissions } from '../../../types'
import { ModalDialog } from '@remix-ui/modal-dialog'

interface PermissionSettingsProps {
  pluginSettings: PluginManagerSettings
}

function PermisssionsSettings ({ pluginSettings }: PermissionSettingsProps) {
  /**
   * Declare component local state
   */
  const [modalVisibility, setModalVisibility] = useState<boolean>(true)
  const [permissions] = useState<PluginPermissions | null>(
    JSON.parse(localStorage.getItem('plugins/permissions') || '{}'))
  const [verifyPermission, setVerifyPermission] = useState(false)
  const closeModal = () => setModalVisibility(true)

  const displayPermissions = useCallback(() => {
    if (permissions && Object.keys(permissions).length > 0) {
      setVerifyPermission(true)
    }
  }, [permissions])

  useEffect(() => {
    displayPermissions()
  }, [displayPermissions, permissions])
  // console.log('fetched permissions', permissions)

  function ShowPluginHeading ({ headingName }) {
    return (
      <div className="pb-2 remixui_permissionKey">
        <h3>{headingName} permissions:</h3>
        <i
          onClick={() => pluginSettings.clearAllPersmission('topLevelPluginNameP')}
          className="far fa-trash-alt"
          data-id={`pluginManagerSettingsClearAllPermission-${headingName}`}>

        </i>
      </div>
    )
  }

  function ShowCheckBox ({ allow, pluginName, functionName, topLevelPluginName }: {
    allow: boolean,
    pluginName: string,
    functionName: string,
    topLevelPluginName: string
  }) {
    const [checkBoxState, setCheckBoxState] = useState(allow)

    useEffect(() => {

    }, [checkBoxState])

    const handleCheckboxClick = () => {
      setCheckBoxState(!checkBoxState)
    }
    return (
      <div className="form-group remixui_permissionKey">
        <div className="remixui_checkbox">
          <span className="mr-2">
            <input
              type="checkbox"
              onChange={handleCheckboxClick}
              checked={checkBoxState}
              id={`permission-checkbox-${topLevelPluginName}-${functionName}-${pluginName}`}
              aria-describedby={`module ${pluginName} asks permission for ${functionName}`}
            />
            <label
              className="ml-4"
              htmlFor={`permission-checkbox-${topLevelPluginName}-${functionName}-${topLevelPluginName}`}
              data-id={`permission-label-${topLevelPluginName}-${functionName}-${topLevelPluginName}`}
            >
                Allow <u>{pluginName}</u> to call <u>{functionName}</u>
            </label>
          </span>
        </div>
        <i
          onClick={() => pluginSettings.clearPersmission(pluginName, topLevelPluginName, functionName)}
          className="fa fa-trash-alt"
          data-id={`pluginManagerSettingsRemovePermission-${topLevelPluginName}-${functionName}-${topLevelPluginName}`}
        />
      </div>
    )
  }

  return (
    <Fragment>
      <ModalDialog
        handleHide={closeModal}
        hide={modalVisibility}
        title="Plugin Manager Permissions"
        okLabel="OK"
        cancelLabel="Cancel"
      >
        {verifyPermission ? (<h4 className="text-center">Current Permission Settings</h4>) : (<h4 className="text-center">No Permission requested yet.</h4>)}
        <form className="remixui_permissionForm" data-id="pluginManagerSettingsPermissionForm">
          <div className="p-2">
            {
              Object.keys(permissions).map(toplevelName => (
                <ShowPluginHeading key={toplevelName} headingName={toplevelName} />
              ))
            }
            {
              Object.keys(permissions).map(topName => {
                return Object.keys(permissions[topName]).map(funcName => {
                  return Object.keys(permissions[topName][funcName]).map(pluginName => (
                    <ShowCheckBox
                      allow={permissions[topName][funcName][pluginName].allow}
                      functionName={funcName}
                      pluginName={pluginName}
                      topLevelPluginName={topName}
                      key={pluginName}
                    />
                  ))
                })
              })
            }
          </div>
        </form>
      </ModalDialog>
      <footer className="bg-light remixui_permissions remix-bg-opacity">
        <button
          onClick={() => setModalVisibility(!modalVisibility)}
          className="btn btn-primary settings-button"
          data-id="pluginManagerPermissionsButton">
          Permissions
        </button>
      </footer>
    </Fragment>
  )
}
export default PermisssionsSettings
