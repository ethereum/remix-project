import React, { useState } from 'react'
import { CustomTooltip } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'
import { ROOT_PATH } from '../utils/constants'

export type FileHoverIconsProps = {
  isEditable?: boolean
  file: any
  handleNewFolderOp?: any
  handleNewFileOp?: any
  renamePathOp?: any
  deletePathOp?: any
}

export function FileHoverIcons(props: FileHoverIconsProps) {

  return (
    <>
      {<div className="d-flex flex-row align-items-center" style={{ marginLeft: '6rem' }}>
        {
          props.file.isDirectory ? (
            <>
              {/* <CustomTooltip
                placement="right-start"
                delay={{show: 1000, hide: 0}}
                tooltipText={<FormattedMessage id="filePanel.edit" />}
                tooltipId={`filePanel.edit.${props.file.path}`}
                tooltipClasses="text-nowrap"
              > */}
              <span
                className="far fa-folder fa-1x remixui_icons_space remixui_icons"
                onClick={async (e) => {
                  e.stopPropagation()
                  console.log(props)
                  await props.handleNewFolderOp(props.file.path)
                  console.log('clicked on folder icon')
                }}
              ></span>
              {/* </CustomTooltip> */}
              {/* <CustomTooltip
                placement="right-start"
                delay={{show: 1000, hide: 0}}
                tooltipText={<FormattedMessage id="fileExplorer.edit" />}
                tooltipId={`fileExplorer.edit.${props.file.path}`}
                tooltipClasses="text-nowrap"
              > */}
              <span
                className="far fa-file fa-1x remixui_icons remixui_icons_space"
                onClick={async (e) => {
                  e.stopPropagation()
                  await props.handleNewFileOp(props.file.path)
                  console.log('clicked on file icon')
                }}
              ></span>
              {/* </CustomTooltip> */}
            </>
          ) : null
        }
        {/* <CustomTooltip
          placement="right-start"
          delay={{show: 1000, hide: 0}}
          tooltipText={<FormattedMessage id="fileExplorer.edit" />}
          tooltipId={`fileExplorer.edit.${props.file.path}`}
          tooltipClasses="text-nowrap"
        > */}
        <span
          className="far fa-pen fa-1x remixui_icons remixui_icons_space"
          onClick={async (e) => {
            e.stopPropagation()
            console.log(props)
            console.log(e)
            await props.renamePathOp(props.file.path, props.file.type)
            console.log('clicked on edit icon')
          }}
        ></span>
        {/* </CustomTooltip> */}
        {/* <CustomTooltip
          placement="right-start"
          delay={{show: 1000, hide: 0}}
          tooltipText={<FormattedMessage id="fileExplorer.edit" />}
          tooltipId={`fileExplorer.edit.${props.file.path}`}
          tooltipClasses="text-nowrap"
        > */}
        <span
          className="far fa-trash fa-1x remixui_icons remixui_icons_space"
          onClick={async (e) => {
            e.stopPropagation()
            console.log(props)
            console.log(e)
            console.log('clicked on trash icon')
            await props.deletePathOp(props.file.path)
          }}
        ></span>
        {/* </CustomTooltip> */}
      </div>
      }
    </>
  )
}
