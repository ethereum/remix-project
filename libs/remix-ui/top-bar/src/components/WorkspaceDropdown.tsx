import { CustomTopbarMenu } from '@remix-ui/helper'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Dropdown, Overlay } from 'react-bootstrap'
import { remote } from '@remix-api'

interface Branch {
  name: string
  remote: remote
}

interface SubItem {
  label: string
  onClick: () => void
  icon: string
}

interface MenuItem {
  name: string
  isGitRepo: boolean
  hasGitSubmodules?: boolean
  branches?: Branch[]
  currentBranch?: Branch
  isGist: string
  submenu: SubItem[]
}

interface WorkspacesDropdownProps {
  items: MenuItem[]
  toggleDropdown: any
  showDropdown: boolean
  selectedWorkspace: any
  currentWorkspace: any
  NO_WORKSPACE: string
  switchWorkspace: any
  ShowNonLocalHostMenuItems: () => JSX.Element
  CustomToggle: any
  global: any
  showSubMenuFlyOut: boolean
  setShowSubMenuFlyOut: (show: boolean) => void
  createWorkspace: () => void
  renameCurrentWorkspace: () => void
  downloadCurrentWorkspace: () => void
  deleteCurrentWorkspace: () => void
  downloadWorkspaces: () => void
  restoreBackup: () => void
  deleteAllWorkspaces: () => void
}

function useClickOutside(refs: React.RefObject<HTMLElement>[], handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      for (const ref of refs) {
        if (ref.current?.contains(e.target as Node)) return
      }
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [refs, handler])
}

export const WorkspacesDropdown: React.FC<WorkspacesDropdownProps> = ({ items, toggleDropdown, showDropdown, selectedWorkspace, currentWorkspace, NO_WORKSPACE, switchWorkspace, ShowNonLocalHostMenuItems, CustomToggle, global, createWorkspace, renameCurrentWorkspace, downloadCurrentWorkspace, deleteCurrentWorkspace, downloadWorkspaces, restoreBackup, deleteAllWorkspaces }) => {
  const [showMain, setShowMain] = useState(false)
  const [openSub, setOpenSub] = useState<number | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const subRefs = useMemo( // useMemo or else rules of hooks is broken.
    () => items.map(() => React.createRef<HTMLDivElement>()),
    [items.length]
  )
  const [togglerText, setTogglerText] = useState<string>(NO_WORKSPACE)

  useEffect(() => {
    global.plugin.on('filePanel', 'setWorkspace', (workspace) => {
      setTogglerText(workspace.name)
    })
  }, [])

  useClickOutside([mainRef, ...subRefs], () => {
    setShowMain(false)
    setOpenSub(null);
  })

  const toggleSub = (idx: number) =>
    setOpenSub(prev => (prev === idx ? null : idx));

  return (
    <div ref={mainRef} >
      <Dropdown
        show={showMain}
        onToggle={setShowMain}
        id="workspacesSelect"
        data-id="workspacesSelect"
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

        <Dropdown.Menu
          as={CustomTopbarMenu}
          innerXPadding="px-2"
          className="custom-dropdown-items w-100"
          data-id="topbar-custom-dropdown-items"
          style={{
            overflow: 'visible'
          }}
          popperConfig={{
            modifiers: [
              {
                name: 'preventOverflow',
                options: {
                  boundary: 'viewport'
                }
              },
              {
                name: 'flip',
                options: {
                  fallbackPlacements: ['right-start']
                }
              }
            ]
          }}
        >
          <div
            className="overflow-y-scroll p-1"
            style={{
              maxHeight: '160px',
              overflowY: 'scroll'
            }}
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                ref={subRefs[idx]}
                style={{
                  position: 'relative',
                  paddingRight: 0
                }}
                className="d-flex align-items-center"
              >
                {/* label */}
                <Dropdown.Item
                  className="dropdown-item text-truncate"
                  style={{ flexGrow: 1, cursor: 'default' }}
                  onClick={() => {
                    switchWorkspace(item.name)
                  }}
                >
                  {item.isGitRepo && item.currentBranch && (
                    <i className="fas fa-code-branch pt-1"></i>
                  )}
                  <span className="pl-1">{item.name}</span>
                </Dropdown.Item>

                {/* submenu toggle */}
                <div
                  onClick={e => { e.stopPropagation(); toggleSub(idx) }}
                  style={{ padding: '', cursor: 'pointer' }}
                  ref={subRefs[idx]}
                >
                ⋮
                </div>
                <Overlay
                  target={subRefs[idx].current}
                  show={openSub === idx}
                  placement="right-start"
                  containerPadding={8}
                >
                  {({ placement, arrowProps, show: _show, popper, ...overlayProps }) => (
                    <div
                      {...overlayProps}
                      style={{
                        position: 'absolute',
                        borderRadius: 4,
                        boxShadow: '0 0.5rem 1rem rgba(0,0,0,.175)',
                        backgroundColor: '#36384c',
                        zIndex: 2000,
                        left: '86dvh',
                        top: '10dvh',
                        height: '130px',
                        width: '120px',
                        ...overlayProps.style
                      }}
                      className="border pt-2 "
                    >
                      {item.submenu.map((sub, index) => (
                        index < item.submenu.length - 1 ? (
                          <Dropdown.Item
                            key={index}
                            className="dropdown-item d-flex align-items-center text-decoration-none"
                            onClick={() => {
                              sub.onClick()
                              setShowMain(false)
                              setOpenSub(null)
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <span className="mr-2">
                              <i className={sub.icon} />
                            </span>
                            <span>{sub.label}</span>
                          </Dropdown.Item>
                        ) : (
                          <>
                            <Dropdown.Divider
                              className="border mb-0 mt-0 remixui_menuhr"
                              style={{ pointerEvents: 'none' }}
                            />
                            <Dropdown.Item
                              key={index}
                              className="dropdown-item d-flex align-items-center text-decoration-none text-danger"
                              onClick={() => {
                                sub.onClick()
                                setShowMain(false)
                                setOpenSub(null)
                              }}
                            >
                              <span className="mr-2">
                                <i className={sub.icon} />
                              </span>
                              <span>{sub.label}</span>
                            </Dropdown.Item>
                          </>

                        )
                      ))}
                    </div>
                  )}
                </Overlay>
              </div>
            ))}
          </div>
          <li
            className="w-100 btn btn-primary font-weight-light text-decoration-none mb-2 rounded-lg"
            onClick={createWorkspace}
          >
            <span className="pl-2 " onClick={() => {
              createWorkspace()
              setShowMain(false)
              setOpenSub(null)
            }}>
              <i className="fas fa-desktop mr-2"></i>
                Create a new workspace
            </span>
          </li>
          <Dropdown.Divider className="border mb-0 mt-0 remixui_menuhr" style={{ pointerEvents: 'none' }} />
          <Dropdown.Item onClick={() => {
            window.open('https://github.com/remix-project-org/remix-desktop/releases', '_blank')
            setShowMain(false)
            setOpenSub(null)
          }}>
            <span className="pl-2" style={{ color: '#D678FF' }} onClick={() => {
              window.open('https://github.com/remix-project-org/remix-desktop/releases', '_blank')
              setShowMain(false)
              setOpenSub(null)
            }}>
              <i className="far fa-desktop mr-2"></i>
                Download Remix Desktop
            </span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => {
            downloadCurrentWorkspace()
            setShowMain(false)
            setOpenSub(null)
          }}>
            <span className="pl-2" onClick={() => {
              downloadCurrentWorkspace()
              setShowMain(false)
              setOpenSub(null)
            }}>
              <i className="far fa-download mr-2"></i>
                Backup
            </span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => {
            restoreBackup()
            setShowMain(false)
            setOpenSub(null)
          }}>
            <span className="pl-2" onClick={() => {
              restoreBackup()
              setShowMain(false)
              setOpenSub(null)
            }}>
              <i className="fas fa-upload mr-2"></i>
                Restore
            </span>
          </Dropdown.Item>
          <li className="w-100 btn btn-danger font-weight-light text-decoration-none" onClick={() => {
            deleteAllWorkspaces()
            setShowMain(false)
            setOpenSub(null)
          }}>
            <span className="pl-2 text-white" onClick={() => {
              deleteAllWorkspaces()
              setShowMain(false)
              setOpenSub(null)
            }}>
              <i className="fas fa-trash-can mr-2"></i>
                Delete all Workspaces
            </span>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
