import { CustomTooltip } from '@remix-ui/helper'
import React, { useState, useEffect, } from 'react' //eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { Placement } from 'react-bootstrap/esm/Overlay'
import { FileExplorerMenuProps } from '../types'
const _paq = window._paq = window._paq || []

export const FileExplorerMenu = (props: FileExplorerMenuProps) => {
  const [state, setState] = useState({
    menuItems: [
      {
        action: 'createNewFile',
        title: 'Create new file',
        icon: 'far fa-file',
        placement: 'top'
      },
      {
        action: 'createNewFolder',
        title: 'Create new folder',
        icon: 'far fa-folder',
        placement: 'top'
      },
      {
        action: 'publishToGist',
        title: 'Publish current workspace to GitHub gist',
        icon: 'fab fa-github',
        placement: 'top'
      },
      {
        action: 'uploadFile',
        title: 'Upload files into current workspace',
        icon: 'fa fa-upload',
        placement: 'top'
      },
      {
        action: 'uploadFolder',
        title: 'Upload folder into current workspace',
        icon: 'fas fa-folder-upload',
        placement: 'top'
      },
      {
        action: 'updateGist',
        title: 'Update the current [gist] explorer',
        icon: 'fab fa-github',
        placement: 'bottom-start'
      }
    ].filter(item => props.menuItems && props.menuItems.find((name) => { return name === item.action })),
    actions: {}
  })
  const enableDirUpload = { directory: "", webkitdirectory: "" }

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
      <CustomTooltip
        placement="top"
        tooltipId="remixuilabelTooltip"
        tooltipClasses="text-nowrap"
        tooltipText={props.title}
      >
        <span className='remixui_label' data-path={props.title} style={{ fontWeight: 'bold' }}>{ props.title }</span>
      </CustomTooltip>
      <span className="pl-2">{
        state.menuItems.map(({ action, title, icon, placement }, index) => {
          if (action === 'uploadFile') {
            return (
              <CustomTooltip
                placement={placement as Placement}
                tooltipId="uploadFileTooltip"
                tooltipClasses="text-nowrap"
                tooltipText={<FormattedMessage id={`filePanel.${action}`} defaultMessage={title} />}
                key={`index-${action}-${placement}-${icon}`}
              >
                <label
                  id={action}
                  data-id={'fileExplorerUploadFile' + action }
                  className={icon + ' mb-0 px-1 remixui_newFile'}
                  key={`index-${action}-${placement}-${icon}`}
                >
                    <input id="fileUpload" data-id="fileExplorerFileUpload" type="file" onChange={(e) => {
                      e.stopPropagation()
                      _paq.push(['trackEvent', 'fileExplorer', 'fileAction', action])
                      props.uploadFile(e.target)
                      e.target.value = null
                    }}
                    multiple />
                </label>
              </CustomTooltip>
            )
          } else if (action === 'uploadFolder') {
            return (
              <CustomTooltip
                placement={placement as Placement}
                tooltipId="uploadFolderTooltip"
                tooltipClasses="text-nowrap"
                tooltipText={<FormattedMessage id={`filePanel.${action}`} defaultMessage={title} />}
                key={`index-${action}-${placement}-${icon}`}
              >
                <label
                  id={action}
                  data-id={'fileExplorerUploadFolder' + action }
                  className={icon + ' mb-0 px-1 remixui_newFile'}
                  key={`index-${action}-${placement}-${icon}`}
                >
                    <input id="folderUpload" data-id="fileExplorerFolderUpload" type="file" onChange={(e) => {
                      e.stopPropagation()
                      _paq.push(['trackEvent', 'fileExplorer', 'fileAction', action])
                      props.uploadFolder(e.target)
                      e.target.value = null
                    }}
                    {...enableDirUpload} multiple />
                </label>
              </CustomTooltip>
            )
          } else {
            return (
              <CustomTooltip
                placement={placement as Placement}
                tooltipId={`${action}-${title}-${icon}-${index}`}
                tooltipClasses="text-nowrap"
                tooltipText={<FormattedMessage id={`filePanel.${action}`} defaultMessage={title} />}
                key={`${action}-${title}-${index}`}
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
                  className={'newFile ' + icon + ' px-1 remixui_newFile'}
                  key={`${action}-${title}-${index}`}
                >
                </span>
              </CustomTooltip>
            )
          }
        })}
      </span>
    </>
  )
}

export default FileExplorerMenu
