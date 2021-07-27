import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { PluginManagerSettings, PluginPermissions } from '../../../types'
import { ModalDialog } from '@remix-ui/modal-dialog'
import { RemixUiCheckbox } from '@remix-ui/checkbox'
import { useLocalStorage } from '../../useLocalStorage'
import { type } from 'os'

interface PermissionSettingsProps {
  pluginSettings: PluginManagerSettings
}

type DisplayPermissions = {
  controlPluginName: {
    controlPluginAction: {
      pluginName: {
        allow: boolean
      }
    }
  }
}

function PermisssionsSettings ({ pluginSettings }: PermissionSettingsProps) {
  /**
   * Declare component local state
   */
  const [modalVisibility, setModalVisibility] = useState<boolean>(true)
  const [permissions, setPermissions] = useState<PluginPermissions | null>(
    JSON.parse(localStorage.getItem('plugins/permissions') || '{}'))
  const [showPermissions, setShowPermissions] = useState<PluginPermissions[]>([])
  const [akwaiPermission, setAkwaiPermission] = useState(false)
  const closeModal = () => setModalVisibility(true)

  const displayPermissions = useCallback(() => {
    if (permissions && Object.length > 0) {
      setAkwaiPermission(true)
    }
  }, [permissions])
  const getTopLevelPluginNames = useCallback(() => {
    return Object.keys(permissions).map(pluginName => {
      return pluginName
    })
  }, [permissions])

  const getInnerPluginPermissionDetails = useCallback(() => {
    const showPermissionsCopy = showPermissions
    getTopLevelPluginNames().forEach(topLevelName => {
      Object.keys(permissions[topLevelName]).forEach(functionName => {
        Object.keys(permissions[topLevelName][functionName]).forEach(pluginName => {
          showPermissionsCopy.push(permissions[topLevelName][functionName][pluginName])
          setShowPermissions(showPermissionsCopy)
        })
      })
    })
  }, [getTopLevelPluginNames, permissions, showPermissions])

  useEffect(() => {
    getInnerPluginPermissionDetails()
    displayPermissions()
  }, [displayPermissions, getInnerPluginPermissionDetails, permissions, showPermissions])
  console.log('fetched permissions', permissions)

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
    return (
      <div className="form-group remixui_permissionKey">
        <div className="remixui_checkbox">
          <span className="mr-2">
            <RemixUiCheckbox
              onChange={() => {}}
              checked={allow}
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
      </div>
    )
  }

  return (
    <Fragment>
      <ModalDialog
        handleHide={closeModal}
        hide={modalVisibility}
        title="Plugin Manager Permissions"
      >
        {akwaiPermission ? (<h4 className="text-center">Current Permission Settings</h4>) : (<h4 className="text-center">No Permission requested yet.</h4>)}
        <form className="remixui_permissionForm" data-id="pluginManagerSettingsPermissionForm">
          <div className="border p-2">
            {
              Object.keys(permissions).map(toplevelName => (
                <ShowPluginHeading key={toplevelName} headingName={toplevelName} />
              ))
            }
            {
              Object.keys(permissions).forEach(topName => {
                Object.keys(permissions[topName]).map(funcName => {
                  return Object.keys(permissions[topName][funcName]).map(pluginName => (
                    <ShowCheckBox
                      allow={permissions.fileManager.writeFile[pluginName].allow}
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
