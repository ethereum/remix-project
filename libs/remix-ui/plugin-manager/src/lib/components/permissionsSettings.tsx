/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useEffect, useState } from 'react'
/* eslint-disable-line */
import { ModalDialog } from '@remix-ui/modal-dialog'
import useLocalStorage from '../custom-hooks/useLocalStorage'
import { PluginPermissions } from '../../types'
// import { PluginManagerSettings, PluginPermissions } from '../../types'

interface PermissionSettingsProps {
  pluginSettings: any
}

function PermisssionsSettings ({ pluginSettings }: PermissionSettingsProps) {
  /**
   * Declare component local state
   */
  const [modalVisibility, setModalVisibility] = useState<boolean>(true)
  const [permissions, setPermissions] = useLocalStorage<PluginPermissions>('plugins/permissions', {} as PluginPermissions)
  const closeModal = () => setModalVisibility(true)
  const openModal = () => {
    const currentValue = JSON.parse(window.localStorage.getItem('plugins/permissions') || '{}')
    setPermissions(currentValue)
    setModalVisibility(!modalVisibility)
  }

  function ShowPluginHeading ({ headingName }) {
    return (
      <div className="pb-2 remixui_permissionKey">
        <h3>{headingName} permissions:</h3>
        <i
          onClick={() => {
            clearPersmission(headingName)
          }}
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
    const [showPermissions, setShowPermissions] = useLocalStorage<PluginPermissions>('plugins/permissions', {} as PluginPermissions)

    // useEffect(() => {
    //   console.log({ permissions })
    // }, [checkBoxState, permissions])

    const handleCheckboxClick = () => {
      const copyPermissions = showPermissions
      copyPermissions[pluginName][functionName][topLevelPluginName].allow = !checkBoxState
      setCheckBoxState(!checkBoxState)
      setShowPermissions(copyPermissions)
    }
    return (
      <div className="form-group remixui_permissionKey">
        { showPermissions && Object.keys(showPermissions).length > 0
          ? (
            <><div className="remixui_checkbox">
              <span className="mr-2">
                <input
                  type="checkbox"
                  onChange={handleCheckboxClick}
                  checked={checkBoxState}
                  id={`permission-checkbox-${topLevelPluginName}-${functionName}-${pluginName}`}
                  aria-describedby={`module ${pluginName} asks permission for ${functionName}`} />
                <label
                  className="ml-4"
                  htmlFor={`permission-checkbox-${topLevelPluginName}-${functionName}-${topLevelPluginName}`}
                  data-id={`permission-label-${topLevelPluginName}-${functionName}-${topLevelPluginName}`}
                >
                  Allow <u>{pluginName}</u> to call <u>{functionName}</u>
                </label>
              </span>
            </div><i
              onClick={() => {
                clearAllPersmissions(pluginName, topLevelPluginName, functionName)
              } }
              className="fa fa-trash-alt"
              data-id={`pluginManagerSettingsRemovePermission-${topLevelPluginName}-${functionName}-${topLevelPluginName}`} /></>
          ) : null
        }
      </div>
    )
  }

  useEffect(() => {
    console.log({ permissions })
  }, [Object.keys(permissions).length])
  function clearAllPersmissions (pluginName: string, topLevelPluginName: string, funcName: string) {
    const permissionsCopy = permissions // don't mutate state
    if (permissionsCopy[topLevelPluginName] && permissionsCopy[topLevelPluginName][funcName]) {
      delete permissionsCopy[topLevelPluginName][funcName][pluginName]
      if (Object.keys(permissionsCopy[topLevelPluginName][funcName]).length === 0) {
        delete permissionsCopy[topLevelPluginName][funcName]
      }
      if (Object.keys(permissionsCopy[topLevelPluginName]).length === 0) {
        delete permissionsCopy[topLevelPluginName]
      }
    }
    setPermissions(permissionsCopy)
  }

  function clearPersmission (topLevelPluginName: string) {
    const permissionsCopy = permissions
    if (permissionsCopy[topLevelPluginName]) {
      delete permissionsCopy[topLevelPluginName]
    }
    setPermissions({} as PluginPermissions)
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
        {permissions && Object.keys(permissions).length > 0
          ? (<h4 className="text-center">Current Permission Settings</h4>)
          : (<h4 className="text-center">No Permission requested yet.</h4>)
        }
        <form className="remixui_permissionForm" data-id="pluginManagerSettingsPermissionForm">
          <div className="p-2">
            {
              Object.keys(permissions).map(toplevelName => (
                <ShowPluginHeading key={toplevelName} headingName={toplevelName} />
              ))
            }
            {
              permissions && Object.keys(permissions).length > 0 ? Object.keys(permissions).map(topName => {
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
              }) : null
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
