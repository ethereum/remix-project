import React, { useEffect, useState, useRef } from 'react' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd' // eslint-disable-line
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, File } from './types'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'

import './css/file-explorer.css'

export const FileExplorer = (props: FileExplorerProps) => {
  const { filesProvider, name, registry, plugin } = props
  const containerRef = useRef(null)
  const [state, setState] = useState({
    focusElement: [{
      key: name,
      type: 'folder'
    }],
    focusPath: null,
    files: [],
    fileManager: null,
    accessToken: null,
    ctrlKey: false,
    newFileName: '',
    actions: [],
    focusContext: {
      element: null,
      x: null,
      y: null
    },
    focusEdit: {
      element: null,
      type: '',
      isNew: false
    },
    fileExternallyChanged: false
  })

  useEffect(() => {
    (async () => {
      const fileManager = registry.get('filemanager').api
      const config = registry.get('config').api
      const accessToken = config.get('settings/gist-access-token')
      const files = await fetchDirectoryContent(name)
      const actions = [{
        name: 'New File',
        type: ['folder']
      }, {
        name: 'New Folder',
        type: ['folder']
      }, {
        name: 'Rename',
        type: ['file', 'folder']
      }, {
        name: 'Delete',
        type: ['file', 'folder']
      }, {
        name: 'Push changes to gist',
        type: []
      }]

      setState(prevState => {
        return { ...prevState, fileManager, accessToken, files, actions }
      })
    })()
  }, [])

  const resolveDirectory = async (folderPath, dir: File[]): Promise<File[]> => {
    dir = await Promise.all(dir.map(async (file) => {
      if (file.path === folderPath) {
        file.child = await fetchDirectoryContent(folderPath)
        return file
      } else if (file.child) {
        file.child = await resolveDirectory(folderPath, file.child)
        return file
      } else {
        return file
      }
    }))

    return dir
  }

  const fetchDirectoryContent = async (folderPath: string): Promise<File[]> => {
    return new Promise((resolve) => {
      filesProvider.resolveDirectory(folderPath, (error, fileTree) => {
        if (error) console.error(error)
        const files = normalize(folderPath, fileTree)

        resolve(files)
      })
    })
  }

  const normalize = (path, filesList): File[] => {
    const folders = []
    const files = []
    const prefix = path.split('/')[0]

    Object.keys(filesList || {}).forEach(key => {
      const path = prefix + '/' + key

      if (filesList[key].isDirectory) {
        folders.push({
          path,
          name: extractNameFromKey(path),
          isDirectory: filesList[key].isDirectory
        })
      } else {
        files.push({
          path,
          name: extractNameFromKey(path),
          isDirectory: filesList[key].isDirectory
        })
      }
    })

    return [...folders, ...files]
  }

  const extractNameFromKey = (key: string):string => {
    const keyPath = key.split('/')

    return keyPath[keyPath.length - 1]
  }

  const extractParentFromKey = (key: string):string => {
    if (!key) return
    const keyPath = key.split('/')
    keyPath.pop()

    return keyPath.join('/')
  }

  const createNewFile = (parentFolder: string, newFilePath: string) => {
    // if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key : extractParentFromKey(state.focusElement[0].key) : name
    const fileManager = state.fileManager

    helper.createNonClashingName(newFilePath, filesProvider, async (error, newName) => {
      // if (error) return tooltip('Failed to create file ' + newName + ' ' + error)
      if (error) return
      const createFile = await fileManager.writeFile(newName, '')

      if (!createFile) {
        // tooltip('Failed to create file ' + newName)
      } else {
        addFile(parentFolder, newFilePath)
        await fileManager.open(newName)
      }
    })
    // }, null, true)
  }

  const createNewFolder = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key : extractParentFromKey(state.focusElement[0].key) : name
    else if (parentFolder.indexOf('.sol') !== -1) parentFolder = extractParentFromKey(parentFolder)
    // const self = this
    // modalDialogCustom.prompt('Create new folder', '', 'New folder', (input) => {
    //   if (!input) {
    //     return tooltip('Failed to create folder. The name can not be empty')
    //   }

    const fileManager = state.fileManager
    const newFolderName = parentFolder + '/' + 'unnamed' + Math.floor(Math.random() * 101) // get filename from state (state.newFileName)
    const dirName = newFolderName + '/'
    // if (error) return tooltip('Unexpected error while creating folder: ' + error)
    const exists = fileManager.exists(dirName)

    if (exists) return
    try {
      await fileManager.mkdir(dirName)
      addFolder(parentFolder, newFolderName)
    } catch (e) {
      // tooltip('Failed to create file ' + newName)
    }
    // }, null, true)
  }

  const deletePath = async (path: string) => {
    // if (self.files.isReadOnly(key)) { return tooltip('cannot delete file. ' + self.files.type + ' is a read only explorer') }
    if (filesProvider.isReadOnly(path)) return
    // const currentFilename = extractNameFromKey(path)

    // modalDialogCustom.confirm(
    //   'Delete file', `Are you sure you want to delete ${currentFilename} file?`,
    //   async () => {
    try {
      const fileManager = state.fileManager

      await fileManager.remove(path)
      const files = removePath(path, state.files)
      const updatedFiles = files.filter(file => file)

      setState(prevState => {
        return { ...prevState, files: updatedFiles }
      })
    } catch (e) {
      // tooltip(`Failed to remove file ${key}.`)
    }
    // },
    // () => {}
    // )
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      const fileManager = state.fileManager
      const exists = fileManager.exists(newPath)

      if (exists) return
      // modalDialogCustom.alert(File already exists.)
      await fileManager.rename(oldPath, newPath)
      const files = replacePath(oldPath, newPath, state.files)

      setState(prevState => {
        return { ...prevState, files }
      })
    } catch (error) {
      // modalDialogCustom.alert('Unexpected error while renaming: ' + error)
    }
  }

  const addFile = async (parentFolder: string, newFilePath: string) => {
    if (parentFolder === name) {
      setState(prevState => {
        return {
          ...prevState,
          files: [...prevState.files, {
            path: newFilePath,
            name: extractNameFromKey(newFilePath),
            isDirectory: false
          }],
          focusElement: [{ key: newFilePath, type: 'file' }]
        }
      })
    } else {
      const updatedFiles = await resolveDirectory(parentFolder, state.files)

      setState(prevState => {
        return { ...prevState, files: updatedFiles, focusElement: [{ key: newFilePath, type: 'file' }] }
      })
    }
    if (newFilePath.includes('_test.sol')) {
      plugin.events.trigger('newTestFileCreated', [newFilePath])
    }
  }

  const addEmptyFile = (parentFolder: string, files: File[]): File[] => {
    if (parentFolder === name) {
      files.push({
        path: 'browser/blank',
        name: '',
        isDirectory: false
      })
      return files
    }
    return files.map(file => {
      if (file.child) {
        if (file.path === parentFolder) {
          file.child = [...file.child, {
            path: file.path + '/blank',
            name: '',
            isDirectory: false
          }]
          return file
        } else {
          file.child = addEmptyFile(parentFolder, file.child)

          return file
        }
      } else {
        return file
      }
    })
  }

  const addFolder = async (parentFolder: string, newFolderName: string) => {
    if (parentFolder === name) {
      setState(prevState => {
        return {
          ...prevState,
          files: [{
            path: newFolderName,
            name: extractNameFromKey(newFolderName),
            isDirectory: true
          }, ...prevState.files],
          focusElement: [{ key: newFolderName, type: 'folder' }]
        }
      })
    } else {
      const updatedFiles = await resolveDirectory(parentFolder, state.files)

      setState(prevState => {
        return { ...prevState, files: updatedFiles, focusElement: [{ key: newFolderName, type: 'folder' }] }
      })
    }
  }

  const removePath = (path: string, files: File[]): File[] => {
    return files.map(file => {
      if (file.path === path) {
        return null
      } else if (file.child) {
        const childFiles = removePath(path, file.child)

        file.child = childFiles.filter(file => file)
        return file
      } else {
        return file
      }
    })
  }

  const replacePath = (oldPath: string, newPath: string, files: File[]): File[] => {
    return files.map(file => {
      if (file.path === oldPath) {
        return {
          ...file,
          path: newPath,
          name: extractNameFromKey(newPath)
        }
      } else if (file.child) {
        file.child = replacePath(oldPath, newPath, file.child)

        return file
      } else {
        return file
      }
    })
  }

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

  // const fileAdded = (filepath) => {
  //   const folderpath = filepath.split('/').slice(0, -1).join('/')
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
  // }

  const handleClickFile = (path: string) => {
    state.fileManager.open(path)
    setState(prevState => {
      return { ...prevState, focusElement: [{ key: path, type: 'file' }] }
    })
  }

  const handleClickFolder = async (path: string) => {
    if (state.ctrlKey) {
      if (state.focusElement.findIndex(item => item.key === path) !== -1) {
        setState(prevState => {
          return { ...prevState, focusElement: [...prevState.focusElement.filter(item => item.key !== path)] }
        })
      } else {
        setState(prevState => {
          return { ...prevState, focusElement: [...prevState.focusElement, { key: path, type: 'folder' }] }
        })
      }
    } else {
      const files = await resolveDirectory(path, state.files)

      setState(prevState => {
        return { ...prevState, focusElement: [{ key: path, type: 'folder' }], files }
      })
    }
  }

  const handleContextMenuFile = (pageX: number, pageY: number, path: string) => {
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY } }
    })
  }

  const handleContextMenuFolder = (pageX: number, pageY: number, path: string) => {
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY } }
    })
  }

  const hideContextMenu = () => {
    setState(prevState => {
      return { ...prevState, focusContext: { element: null, x: 0, y: 0 } }
    })
  }

  const editModeOn = (path: string, type: string, isNew: boolean = false) => {
    if (filesProvider.isReadOnly(path)) return
    setState(prevState => {
      return { ...prevState, focusEdit: { element: path, isNew, type } }
    })
  }

  const editModeOff = async (content: string) => {
    const parentFolder = state.focusEdit.type === 'folder' ? state.focusEdit.element : extractParentFromKey(state.focusEdit.element)

    if (!content || (content.trim() === '')) {
      if (state.focusEdit.isNew) {
        const files = removePath(state.focusEdit.element, state.files)
        const updatedFiles = files.filter(file => file)

        setState(prevState => {
          return { ...prevState, files: updatedFiles, focusEdit: { element: null, isNew: false, type: '' } }
        })
      } else {
        // modalDialogCustom.alert('Are you sure you want to delete this file?')
        if (true) { // eslint-disable-line
          await deletePath(state.focusEdit.element)

          setState(prevState => {
            return { ...prevState, focusEdit: { element: null, isNew: false, type: '' } }
          })
        } else {

        }
      }
      return
    }
    if (state.focusEdit.isNew) {
      createNewFile(parentFolder, parentFolder + '/' + content)
      const files = removePath(state.focusEdit.element, state.files)
      const updatedFiles = files.filter(file => file)

      setState(prevState => {
        return { ...prevState, files: updatedFiles }
      })
    } else {
      if (helper.checkSpecialChars(content)) return
      // modalDialogCustom.alert('Special characters are not allowed')
      const oldPath: string = state.focusEdit.element
      const oldName = extractNameFromKey(oldPath)
      const newPath = oldPath.replace(oldName, content)

      renamePath(oldPath, newPath)
    }
    setState(prevState => {
      return { ...prevState, focusEdit: { element: null, isNew: false, type: '' } }
    })
  }

  const handleNewFileInput = (parentFolder?: string) => {
    if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key : extractParentFromKey(state.focusElement[0].key) : name

    const files = addEmptyFile(parentFolder, state.files)
    setState(prevState => {
      return { ...prevState, files }
    })
    editModeOn(parentFolder + '/blank', 'file', true)
  }

  // warn if file changed outside of Remix
  const remixdDialog = () => {
    return <div>This file has been changed outside of Remix IDE.</div>
  }

  const label = (data: File) => {
    return (
      <div className='remixui_items'>
        <span
          title={data.path}
          className={'remixui_label ' + (data.isDirectory ? 'folder' : 'remixui_leaf')}
          data-path={data.path}
        >
          { data.name }
        </span>
      </div>
    )
  }

  const renderFiles = (file: File, index: number) => {
    if (file.isDirectory) {
      return (
        <div key={index}>
          <TreeViewItem
            id={`treeViewItem${file.path}`}
            iconX='pr-3 far fa-folder'
            iconY='pr-3 far fa-folder-open'
            key={`${file.path + index}`}
            label={label(file)}
            onClick={(e) => {
              e.stopPropagation()
              handleClickFolder(file.path)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleContextMenuFolder(e.pageX, e.pageY, file.path)
            }}
            labelClass={ state.focusEdit.element === file.path ? 'bg-light' : state.focusElement.findIndex(item => item.key === file.path) !== -1 ? 'bg-secondary' : '' }
            editable={state.focusEdit.element === file.path}
            onBlur={(value) => editModeOff(value)}
            controlBehaviour={ state.ctrlKey }
          >
            {
              file.child ? <TreeView id={`treeView${file.path}`} key={index}>{
                file.child.map((file, index) => {
                  return renderFiles(file, index)
                })
              }
              </TreeView> : <TreeView id={`treeView${file.path}`} key={index} />
            }
            { ((state.focusContext.element === file.path) && (state.focusEdit.element !== file.path)) &&
            <FileExplorerContextMenu
              actions={state.actions}
              hideContextMenu={hideContextMenu}
              createNewFile={handleNewFileInput}
              createNewFolder={createNewFolder}
              deletePath={deletePath}
              renamePath={editModeOn}
              pageX={state.focusContext.x}
              pageY={state.focusContext.y}
              path={file.path}
              type='folder'
            />
            }
          </TreeViewItem>
        </div>
      )
    } else {
      return (
        <div key={index}>
          <TreeViewItem
            id={`treeViewItem${file.path}`}
            key={index}
            label={label(file)}
            onClick={(e) => {
              e.stopPropagation()
              if (state.focusEdit.element !== file.path) handleClickFile(file.path)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleContextMenuFile(e.pageX, e.pageY, file.path)
            }}
            icon='fa fa-file'
            labelClass={ state.focusEdit.element === file.path ? 'bg-light' : state.focusElement.findIndex(item => item.key === file.path) !== -1 ? 'bg-secondary' : '' }
            editable={state.focusEdit.element === file.path}
            onBlur={(value) => editModeOff(value)}
          />
          { ((state.focusContext.element === file.path) && (state.focusEdit.element !== file.path)) &&
            <FileExplorerContextMenu
              actions={state.actions}
              hideContextMenu={hideContextMenu}
              createNewFile={handleNewFileInput}
              createNewFolder={createNewFolder}
              deletePath={deletePath}
              renamePath={editModeOn}
              pageX={state.focusContext.x}
              pageY={state.focusContext.y}
              path={file.path}
              type='file'
            />
          }
        </div>
      )
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.shiftKey) {
          setState(prevState => {
            return { ...prevState, ctrlKey: true }
          })
        }
      }}
      onKeyUp={() => {
        setState(prevState => {
          return { ...prevState, ctrlKey: false }
        })
      }}
    >
      <TreeView id='treeView'>
        <TreeViewItem id="treeViewItem"
          label={
            <FileExplorerMenu
              title={name}
              menuItems={props.menuItems}
              addFile={addFile}
              createNewFile={handleNewFileInput}
              createNewFolder={createNewFolder}
              files={filesProvider}
              fileManager={state.fileManager}
              accessToken={state.accessToken}
            />
          }
          expand={true}>
          <div>
            <TreeView id='treeViewMenu'>
              {
                state.files.map((file, index) => {
                  return renderFiles(file, index)
                })
              }
            </TreeView>
          </div>
        </TreeViewItem>
      </TreeView>
    </div>
  )
}

export default FileExplorer
