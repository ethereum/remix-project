import React, { useState } from 'react'
import { CustomTooltip } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'

export type FileHoverIconsProps = {
  isEditable?: boolean
  file: any
  handleNewFolderOp?: any
  handleNewFileOp?: any
  renamePathOp?: (path: string, newName: string) => void | Promise<void>
  deletePathOp?: (path: string | string[]) => void | Promise<void>
}

export function FileHoverIcons(props: FileHoverIconsProps) {

  return (
    <>
      {<div className="d-flex flex-row align-items-center">
        {
          props.file.isDirectory ? (
            <>
              <CustomTooltip
                placement="bottom"
                delay={{show: 1000, hide: 0}}
                tooltipText={<FormattedMessage id="filePanel.createNewFolder" />}
                tooltipId={`filePanel.createNewFolder.${props.file.path}`}
                tooltipClasses="text-nowrap"
              >
                <span
                  className="far fa-folder fa-1x remixui_icons_space remixui_icons"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await props.handleNewFolderOp(props.file.path)
                  }}
                ></span>
              </CustomTooltip>
              <CustomTooltip
                placement="bottom"
                delay={{show: 1000, hide: 0}}
                tooltipText={<FormattedMessage id="filePanel.createNewFile" />}
                tooltipId={`fileExplorer.createNewFile.${props.file.path}`}
                tooltipClasses="text-nowrap"
              >
                <span
                  className="far fa-file fa-1x remixui_icons remixui_icons_space"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await props.handleNewFileOp(props.file.path)
                  }}
                ></span>
              </CustomTooltip>
            </>
          ) : null
        }
        <CustomTooltip
          placement="bottom"
          delay={{show: 1000, hide: 0}}
          tooltipText={<FormattedMessage id="filePanel.rename" />}
          tooltipId={`filePanel.rename.${props.file.path}`}
          tooltipClasses="text-nowrap"
        >
          <span
            className="far fa-pen fa-1x remixui_icons remixui_icons_space"
            onClick={async (e) => {
              e.stopPropagation()
              await props.renamePathOp(props.file.path, props.file.type)
            }}
          ></span>
        </CustomTooltip>
        <CustomTooltip
          placement="bottom"
          delay={{show: 1000, hide: 0}}
          tooltipText={<FormattedMessage id="filePanel.deleteItem" />}
          tooltipId={`filePanel.deleteItem.${props.file.path}`}
          tooltipClasses="text-nowrap"
        >
          <span
            className="far fa-trash fa-1x remixui_icons remixui_icons_space"
            onClick={async (e) => {
              e.stopPropagation()
              await props.deletePathOp(props.file.path)
            }}
          ></span>
        </CustomTooltip>
      </div>
      }
    </>
  )
}
