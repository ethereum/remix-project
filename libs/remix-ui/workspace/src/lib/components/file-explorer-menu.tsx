import { CustomTooltip } from '@remix-ui/helper'
import React, {useState, useEffect, useContext} from 'react' //eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { Placement } from 'react-bootstrap/esm/Overlay'
import { FileExplorerMenuProps } from '../types'
import { FileSystemContext } from '../contexts'
import { appPlatformTypes, platformContext } from '@remix-ui/app'
const _paq = (window._paq = window._paq || [])

export const FileExplorerMenu = (props: FileExplorerMenuProps) => {
  const global = useContext(FileSystemContext)
  const platform = useContext(platformContext)
  const [state, setState] = useState({
    menuItems: [
      {
        action: 'createNewFile',
        title: 'Create new file',
        icon: 'far fa-file',
        placement: 'top',
        platforms:[appPlatformTypes.web, appPlatformTypes.desktop]
      },
      {
        action: 'createNewFolder',
        title: 'Create new folder',
        icon: 'far fa-folder',
        placement: 'top',
        platforms:[appPlatformTypes.web, appPlatformTypes.desktop]
      },
      {
        action: 'uploadFile',
        title: 'Upload files into current workspace',
        icon: 'far fa-upload',
        placement: 'top',
        platforms:[appPlatformTypes.web]
      },
      {
        action: 'uploadFolder',
        title: 'Upload folder into current workspace',
        icon: 'far fa-folder-upload',
        placement: 'top',
        platforms:[appPlatformTypes.web]
      }
    ].filter(
      (item) =>
        props.menuItems &&
        props.menuItems.find((name) => {
          return name === item.action
        })
    ),
    actions: {}
  })
  const enableDirUpload = { directory: '', webkitdirectory: '' }

  return (
    (!global.fs.browser.isSuccessfulWorkspace ? null :
      <>

        <span data-id="spanContaining" className="pl-0 pb-1 w-50">
          {state.menuItems.map(({ action, title, icon, placement, platforms }, index) => {
            if (platforms && !platforms.includes(platform)) return null
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
                    style={{ fontSize: '1.1rem', cursor: 'pointer' }}
                    data-id={'fileExplorerUploadFile' + action}
                    className={icon + ' mx-1 remixui_menuItem'}
                    key={`index-${action}-${placement}-${icon}`}
                  >
                    <input
                      id="fileUpload"
                      data-id="fileExplorerFileUpload"
                      type="file"
                      onChange={(e) => {
                        e.stopPropagation()
                        _paq.push(['trackEvent', 'fileExplorer', 'fileAction', action])
                        props.uploadFile(e.target)
                        e.target.value = null
                      }}
                      multiple
                    />
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
                    style={{ fontSize: '1.1rem', cursor: 'pointer' }}
                    data-id={'fileExplorerUploadFolder' + action}
                    className={icon + ' mx-1 remixui_menuItem'}
                    key={`index-${action}-${placement}-${icon}`}
                  >
                    <input
                      id="folderUpload"
                      data-id="fileExplorerFolderUpload"
                      type="file"
                      onChange={(e) => {
                        e.stopPropagation()
                        _paq.push(['trackEvent', 'fileExplorer', 'fileAction', action])
                        props.uploadFolder(e.target)
                        e.target.value = null
                      }}
                      {...enableDirUpload}
                      multiple
                    />
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
                  <label
                    id={action}
                    style={{ fontSize: '1.1rem', cursor: 'pointer' }}
                    data-id={'fileExplorerNewFile' + action}
                    onClick={(e) => {
                      e.stopPropagation()
                      _paq.push(['trackEvent', 'fileExplorer', 'fileAction', action])
                      if (action === 'createNewFile') {
                        props.createNewFile()
                      } else if (action === 'createNewFolder') {
                        props.createNewFolder()
                      } else if (action === 'publishToGist' || action == 'updateGist') {
                        props.publishToGist()
                      } else {
                        state.actions[action]()
                      }
                    }}
                    className={icon + ' mx-1 remixui_menuItem'}
                    key={`${action}-${title}-${index}`}
                  ></label>
                </CustomTooltip>
              )
            }
          })}
        </span>
      </>)
  )
}

export default FileExplorerMenu
