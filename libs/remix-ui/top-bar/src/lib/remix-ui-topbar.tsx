/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { useContext, useState } from 'react'
import BasicLogo from '../components/BasicLogo'
import '../css/topbar.css'
import { Dropdown } from 'react-bootstrap'
import { CustomToggle } from 'libs/remix-ui/helper/src/lib/components/custom-dropdown'
import { WorkspaceMetadata } from 'libs/remix-ui/workspace/src/lib/types'
import { platformContext } from 'libs/remix-ui/app/src/lib/remix-app/context/context'
import { useIntl } from 'react-intl'
import { FileSystemContext } from 'libs/remix-ui/workspace/src/lib/contexts'

export const RemixUiTopbar = () => {
  const intl = useIntl()
  const global = useContext(FileSystemContext)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceMetadata>(null)
  const platform = useContext(platformContext)
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [togglerText, setTogglerText] = useState<'Connecting' | 'Connected to Local FileSystem'>('Connecting')

  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
  }
  const formatNameForReadonly = (name: string) => {
    return global.fs.readonly ? name + ` (${intl.formatMessage({ id: 'filePanel.readOnly' })})` : name
  }

  return (
    <section className="h-100 p-2 d-flex flex-row align-items-center justify-content-between bg-light border">
      <div className="d-flex flex-row align-items-center justify-content-between">
        <span className="d-flex align-items-center justify-content-between mr-3">
          <span style={{ width: '35px', height: '35px' }} className="remixui_homeIcon"><BasicLogo /></span>
          <span className="text-primary ml-2 font-weight-light text-uppercase" style={{ fontSize: '1.2rem' }}>Remix</span>
        </span>
        <span className="btn btn-sm border border-secondary text-secondary">v0.57.0</span>
      </div>
      <div>
        <Dropdown id="workspacesSelect" data-id="workspacesSelect" onToggle={toggleDropdown} show={showDropdown}>
          <Dropdown.Toggle
            as={CustomToggle}
            id="dropdown-custom-components"
            className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control"
            icon={selectedWorkspace && selectedWorkspace.isGitRepo && !(currentWorkspace === LOCALHOST) ? 'far fa-code-branch' : null}
          >
            {selectedWorkspace ? selectedWorkspace.name === LOCALHOST ? togglerText : selectedWorkspace.name : currentWorkspace === LOCALHOST ? formatNameForReadonly('localhost') : NO_WORKSPACE}
          </Dropdown.Toggle>
        </Dropdown>
      </div>
      <div>
        <span>
          Connect to Github
        </span>
        <span>
          Theme
        </span>
        <span>
          Settings
        </span>
      </div>
    </section>
  )
}
