import React, { useState, useEffect } from 'react' //eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Placement } from 'react-bootstrap/esm/Overlay'
import { FileExplorerMenuProps } from '../types'
const _paq = window._paq = window._paq || []

export const FileExplorerMenu = (props: FileExplorerMenuProps) => {
  const [state, setState] = useState({
    menuItems: [
      {
        action: 'createNewFile',
        title: 'Create New File',
        icon: 'far fa-file',
        placement: 'top-start'
      },
      {
        action: 'createNewFolder',
        title: 'Create New Folder',
        icon: 'far fa-folder',
        placement: 'top-end'
      },
      {
        action: 'publishToGist',
        title: 'Publish all the current workspace files (only root) to a github gist',
        icon: 'fab fa-github',
        placement: 'top-start'
      },
      {
        action: 'uploadFile',
        title: 'Load a local file into current workspace',
        icon: 'fa fa-upload',
        placement: 'right'
      },
      {
        action: 'updateGist',
        title: 'Update the current [gist] explorer',
        icon: 'fab fa-github',
        placement: 'right-start'
      }
    ].filter(item => props.menuItems && props.menuItems.find((name) => { return name === item.action })),
    actions: {}
  })

  useEffect(() => {
    const actions = {
      updateGist: () => {}
    }

    setState(prevState => {
      return { ...prevState, actions }
    })
  }, [])

  return (
    <>
      <OverlayTrigger
        placement="top-start"
        overlay={
          <Tooltip id="remixuilabelTooltip" className="text-nowrap">
            <span>{props.title}</span>
          </Tooltip>
        }
      >
        <span className='remixui_label' data-path={props.title} style={{ fontWeight: 'bold' }}>{ props.title }</span>
      </OverlayTrigger>
      <span className="pl-2">{
        state.menuItems.map(({ action, title, icon, placement }, index) => {
          if (action === 'uploadFile') {
            return (
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="uploadFileTooltip" className="text-nowrap">
                    <span><FormattedMessage id={`filePanel.${action}`} defaultMessage={title} /></span>
                  </Tooltip>
                }
              >
                <label
                  id={action}
                  data-id={'fileExplorerUploadFile' + action }
                  className={icon + ' mb-0 remixui_newFile'}
                  key={index}
                >
                    <input id="fileUpload" data-id="fileExplorerFileUpload" type="file" onChange={(e) => {
                      e.stopPropagation()
                      props.uploadFile(e.target)
                      e.target.value = null
                    }}
                    multiple />
                </label>
              </OverlayTrigger>
            )
          } else {
            return (
              <OverlayTrigger
                placement={placement as Placement}
                overlay={
                  <Tooltip id={`${action}-${title}-${icon}-${index}`} className="text-nowrap">
                    <span><FormattedMessage id={`filePanel.${action}`} defaultMessage={title} /></span>
                  </Tooltip>
                }
              >
                <span
                  id={action}
                  data-id={'fileExplorerNewFile' + action}
                  onClick={(e) => {
                    e.stopPropagation()
                    _paq.push(['trackEvent', 'fileExplorer', 'fileAction', action])
                    if (action === 'createNewFile') {
                      props.createNewFile()
                    } else if (action === 'createNewFolder') {
                      props.createNewFolder()
                    } else if (action === 'publishToGist') {
                      props.publishToGist()
                    } else {
                      state.actions[action]()
                    }
                  }}
                  className={'newFile ' + icon + ' remixui_newFile'}
                  key={`${action}-${title}-${index}`}
                >
                </span>
              </OverlayTrigger>
            )
          }
        })}
      </span>
    </>
  )
}

export default FileExplorerMenu
