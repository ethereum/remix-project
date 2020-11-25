import React, { useEffect, useState } from 'react' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'
import { FileExplorerProps } from './types'

import './css/file-explorer.css'

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

  useEffect(() => {
    if (props.files) {
      console.log('props.files.type: ', props.files.type)
      props.files.event.register('fileAdded', fileAdded)
    }
  }, [props.files])

  const formatSelf = (key, data, li) => {
    const isFolder = !!data.children

    return (
      <div className='remixui_items'>
        <span
          title={data.path}
          className={'remixui_label ' + (!isFolder ? 'remixui_leaf' : 'folder')}
          data-path={data.path}
          // onkeydown=${editModeOff}
          // onblur=${editModeOff}
        >
          {key.split('/').pop()}
        </span>
      </div>
    )
  }

  // self._components = {}
  // self._components.registry = localRegistry || globalRegistry
  // self._deps = {
  //   config: self._components.registry.get('config').api,
  //   editor: self._components.registry.get('editor').api,
  //   fileManager: self._components.registry.get('filemanager').api
  // }

  // self.events.register('focus', function (path) {
  //   self._deps.fileManager.open(path)
  // })

  // self._components.registry.put({ api: self, name: `fileexplorer/${self.files.type}` })

  // warn if file changed outside of Remix
  // function remixdDialog () {
  //   return yo`<div>This file has been changed outside of Remix IDE.</div>`
  // }

  // props.files.event.register('fileExternallyChanged', (path, file) => {
  //   if (self._deps.config.get('currentFile') === path && self._deps.editor.currentContent() && self._deps.editor.currentContent() !== file.content) {
  //     if (this.files.isReadOnly(path)) return self._deps.editor.setText(file.content)

  //     modalDialog(path + ' changed', remixdDialog(),
  //       {
  //         label: 'Replace by the new content',
  //         fn: () => {
  //           self._deps.editor.setText(file.content)
  //         }
  //       },
  //       {
  //         label: 'Keep the content displayed in Remix',
  //         fn: () => {}
  //       }
  //     )
  //   }
  // })

  // register to event of the file provider
  // files.event.register('fileRemoved', fileRemoved)
  // files.event.register('fileRenamed', fileRenamed)
  // files.event.register('fileRenamedError', fileRenamedError)
  // files.event.register('fileAdded', fileAdded)
  // files.event.register('folderAdded', folderAdded)

  // function fileRenamedError (error) {
  //   modalDialogCustom.alert(error)
  // }

  const fileAdded = (filepath) => {
    const folderpath = filepath.split('/').slice(0, -1).join('/')
    console.log('filePath: ', folderpath)
    console.log('folderPath: ', folderpath)
    // const currentTree = self.treeView.nodeAt(folderpath)
    // if (!self.treeView.isExpanded(folderpath)) self.treeView.expand(folderpath)
    // if (currentTree) {
    //   props.files.resolveDirectory(folderpath, (error, fileTree) => {
    //     if (error) console.error(error)
    //     if (!fileTree) return
    //     fileTree = normalize(folderpath, fileTree)
    //     self.treeView.updateNodeFromJSON(folderpath, fileTree, true)
    //     self.focusElement = self.treeView.labelAt(self.focusPath)
    //     // TODO: here we update the selected file (it applicable)
    //     // cause we are refreshing the interface of the whole directory when there's a new file.
    //     if (self.focusElement && !self.focusElement.classList.contains('bg-secondary')) {
    //       self.focusElement.classList.add('bg-secondary')
    //     }
    //   })
    // }
  }

  const extractNameFromKey = (key) => {
    const keyPath = key.split('/')

    return keyPath[keyPath.length - 1]
  }

  const renderMenuItems = () => {
    let items
    if (state.menuItems) {
      items = state.menuItems.map(({ action, title, icon }, index) => {
        if (action === 'uploadFile') {
          return (
            <label
              id={action}
              data-id={'fileExplorerUploadFile' + action }
              className={icon + ' mb-0 remixui_newFile'}
              title={title}
              key={index}
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
              key={index}
            >
            </span>
          )
        }
      })
    }
    return (
      <>
        <span className='remixui_label' title={props.name} data-path={props.name} style={{ fontWeight: 'bold' }}>{ props.name }</span>
        <span className="remixui_menu">{items}</span>
      </>
    )
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
      <TreeView id='treeView'>
        <TreeViewItem id="treeViewItem" label={renderMenuItems()}>

        </TreeViewItem>
      </TreeView>
    </div>
  )
}

export default FileExplorer
