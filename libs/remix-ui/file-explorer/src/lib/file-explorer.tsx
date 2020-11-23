import React, { useReducer, useState } from 'react' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'
import { FileExplorerProps } from './types'

import './file-explorer.css'

function extractData (value, tree, key) {
  const newValue = {}
  let isFile = false

  Object.keys(value).filter((x) => {
    if (x === '/content') isFile = true
    if (x[0] !== '/') return true
  }).forEach((x) => { newValue[x] = value[x] })

  return {
    path: (tree || {}).path ? tree.path + '/' + key : key,
    children: isFile ? undefined
      : value instanceof Array ? value.map((item, index) => ({
        key: index, value: item
      })) : value instanceof Object ? Object.keys(value).map(subkey => ({
        key: subkey, value: value[subkey]
      })) : undefined
  }
}

export const FileExplorer = (props: FileExplorerProps) => {
  const [state, setState] = useState({
    files: props.files,
    focusElement: null,
    focusPath: null,
    menuItems: [
      {
        action: 'createNewFile',
        title: 'Create New File',
        icon: 'fas fa-plus-circle'
      },
      {
        action: 'publishToGist',
        title: 'Publish all [browser] explorer files to a github gist',
        icon: 'fab fa-github'
      },
      {
        action: 'uploadFile',
        title: 'Add Local file to the Browser Storage Explorer',
        icon: 'far fa-folder-open'
      },
      {
        action: 'updateGist',
        title: 'Update the current [gist] explorer',
        icon: 'fab fa-github'
      }
    ].filter(item => props.menuItems && props.menuItems.find((name) => { return name === item.action }))
  })

  const formatSelf = (key, data, li) => {
    const isRoot = data.path === state.files.type
    const isFolder = !!data.children

    return (
      <div className='remixui_items'>
        <span
          title={data.path}
          className={'remixui_label ' + !isRoot ? !isFolder ? 'remixui_leaf' : 'folder' : ''}
          data-path={data.path}
          style={{ fontWeight: isRoot ? 'bold' : null }}
          // onkeydown=${editModeOff}
          // onblur=${editModeOff}
        >
          {key.split('/').pop()}
        </span>
        {isRoot ? renderMenuItems() : ''}
      </div>
    )
  }

  const remixdDialog = () => {
    return <div>This file has been changed outside of Remix IDE.</div>
  }

  const fileRenamedError = (error) => {
    console.log(error)
    // modalDialogCustom.alert(error)
  }

  const extractNameFromKey = (key) => {
    const keyPath = key.split('/')

    return keyPath[keyPath.length - 1]
  }

  const renderMenuItems = () => {
    let items
    if (state.menuItems) {
      items = state.menuItems.map(({ action, title, icon }) => {
        if (action === 'uploadFile') {
          return (
            <label
              id={action}
              data-id={'fileExplorerUploadFile' + action }
              className={icon + ' mb-0 remixui_newFile'}
              title={title}
            >
              <input id="fileUpload" data-id="fileExplorerFileUpload" type="file" onChange={({ stopPropagation, target }) => {
                stopPropagation()
                uploadFile(target)
              }}
              multiple />
            </label>
          )
        } else {
          return (
            <span
              id={action}
              data-id={'fileExplorerNewFile' + action}
              // onclick={({ stopPropagation }) => { stopPropagation(); this[action]() }}
              className={'newFile ' + icon + ' remixui_newFile'}
              title={title}
            >
            </span>
          )
        }
      })
    }
    return <span className="remixui_menu">{items}</span>
  }

  const uploadFile = (target) => {
  // TODO The file explorer is merely a view on the current state of
  // the files module. Please ask the user here if they want to overwrite
  // a file and then just use `files.add`. The file explorer will
  // pick that up via the 'fileAdded' event from the files module.

    ;[...target.files].forEach((file) => {
      const files = state.files

      function loadFile () {
        const fileReader = new FileReader()

        fileReader.onload = async function (event) {
          if (helper.checkSpecialChars(file.name)) {
            // modalDialogCustom.alert('Special characters are not allowed')
            return
          }
          const success = await files.set(name, event.target.result)

          if (!success) {
            // modalDialogCustom.alert('Failed to create file ' + name)
          } else {
            // self.events.trigger('focus', [name])
          }
        }
        fileReader.readAsText(file)
      }
      const name = files.type + '/' + file.name

      files.exists(name, (error, exist) => {
        if (error) console.log(error)
        if (!exist) {
          loadFile()
        } else {
          // modalDialogCustom.confirm('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, () => { loadFile() })
        }
      })
    })
  }

  return (
    <div>

    </div>
  )
}

export default FileExplorer
