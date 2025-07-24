import { CustomTopbarMenu } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap'

export interface WorkspaceDropdownProps {
  toggleDropdown: any
  showDropdown: boolean
  selectedWorkspace: any
  currentWorkspace: any
  NO_WORKSPACE: string
  switchWorkspace: any
  ShowNonLocalHostMenuItems: () => JSX.Element
  CustomToggle: any
  global: any
}

export function WorkspaceDropdown ({ toggleDropdown, showDropdown, selectedWorkspace, currentWorkspace, NO_WORKSPACE, switchWorkspace, ShowNonLocalHostMenuItems, CustomToggle, global }: WorkspaceDropdownProps) {

  const [togglerText, setTogglerText] = useState<string>(NO_WORKSPACE)

  useEffect(() => {
    global.plugin.on('filePanel', 'setWorkspace', (workspace) => {
      setTogglerText(workspace.name)
    })
  }, [])

  console.log('currently selected workspace', selectedWorkspace)
  return (
    <Dropdown
      id="workspacesSelect"
      data-id="workspacesSelect"
      onToggle={toggleDropdown}
      show={showDropdown}
      className="w-75 mx-auto border"
    >
      <Dropdown.Toggle
        as={CustomToggle}
        id="dropdown-custom-components"
        className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control"
        icon={selectedWorkspace && selectedWorkspace.isGitRepo ? 'far fa-code-branch' : null}
      >
        {togglerText}
      </Dropdown.Toggle>
      <Dropdown.Menu as={CustomTopbarMenu} innerXPadding="px-2" className="custom-dropdown-items w-100" data-id="topbar-custom-dropdown-items">
        {global.plugin.workspaces.length > 0 && (
          <>
            <ShowNonLocalHostMenuItems />
            <div style={{ height: '10px', overflowY: 'scroll' }} className="w-100">
              {(global.plugin.workspaces.length <= 0 || currentWorkspace === NO_WORKSPACE) && (
                <Dropdown.Item
                  onClick={() => {
                    switchWorkspace(NO_WORKSPACE)
                  }}
                >
                  {<span className="pl-3">NO_WORKSPACE</span>}
                </Dropdown.Item>
              )}
            </div>
            <li className="w-100 btn btn-primary font-weight-light text-decoration-none mb-2 rounded-lg">
              <span className="pl-2 ">
                <i className="fas fa-desktop mr-2"></i>
                Create a new workspace
              </span>
            </li>
            <Dropdown.Divider className="border mb-0 mt-0 remixui_menuhr" style={{ pointerEvents: 'none' }} />
            <Dropdown.Item>
              <span className="pl-2" style={{ color: '#D678FF' }}>
                <i className="far fa-desktop mr-2"></i>
                Download Remix Desktop
              </span>
            </Dropdown.Item>
            <Dropdown.Item>
              <span className="pl-2">
                <i className="far fa-download mr-2"></i>
                Backup
              </span>
            </Dropdown.Item>
            <Dropdown.Item>
              <span className="pl-2">
                <i className="fas fa-upload mr-2"></i>
                Restore
              </span>
            </Dropdown.Item>
            <li className="w-100 btn btn-danger font-weight-light text-decoration-none">
              <span className="pl-2 text-white">
                <i className="fas fa-trash-can mr-2"></i>
                Delete all Workspaces
              </span>
            </li>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
