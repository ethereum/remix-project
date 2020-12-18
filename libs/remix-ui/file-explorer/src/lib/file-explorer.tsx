import React, { useEffect, useState, useRef } from 'react' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd' // eslint-disable-line
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { FileExplorerProps, File } from './types'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'

import './css/file-explorer.css'

export const FileExplorer = (props: FileExplorerProps) => {
  const { filesProvider, name, registry, plugin } = props
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
      isNew: false,
      lastEdit: ''
    },
    fileExternallyChanged: false,
    expandPath: [],
    modalOptions: {
      hide: true,
      title: '',
      message: '',
      ok: {
        label: 'Ok',
        fn: null
      },
      cancel: {
        label: 'Cancel',
        fn: null
      },
      handleHide: null
    }
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

  const buildTree = (paths: string[]) => {
    if (paths.length > 0) {
      return {
        path: paths[0],
        name: extractNameFromKey(paths[0]),
        isDirectory: true,
        child: [buildTree(paths.filter(item => item !== paths[0]))]
      }
    } else {
      return []
    }
  }

  const createNewFile = (parentFolder: string, newFilePath: string) => {
    const fileManager = state.fileManager

    helper.createNonClashingName(newFilePath, filesProvider, async (error, newName) => {
      // if (error) return tooltip('Failed to create file ' + newName + ' ' + error)
      if (error) return
      const createFile = await fileManager.writeFile(newName, '')

      if (!createFile) {
        // tooltip('Failed to create file ' + newName)
      } else {
        addFile(parentFolder, newName)
        await fileManager.open(newName)
      }
    })
    // }, null, true)
  }

  const createNewFolder = async (parentFolder: string, newFolderPath: string) => {
    const fileManager = state.fileManager
    const dirName = newFolderPath + '/'
    // if (error) return tooltip('Unexpected error while creating folder: ' + error)
    const exists = fileManager.exists(dirName)

    if (exists) return
    try {
      await fileManager.mkdir(dirName)
      addFolder(parentFolder, newFolderPath)
    } catch (e) {
      // tooltip('Failed to create file ' + newName)
    }
  }

  const deletePath = async (path: string) => {
    // if (self.files.isReadOnly(key)) { return tooltip('cannot delete file. ' + self.files.type + ' is a read only explorer') }
    if (filesProvider.isReadOnly(path)) return
    const isDir = state.fileManager.isDirectory(path)

    modal('Delete file', `Are you sure you want to delete ${path} ${isDir ? 'folder' : 'file'}?`, {
      label: 'Ok',
      fn: async () => {
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
      }
    }, {
      label: 'Cancel',
      fn: () => {}
    })
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      const fileManager = state.fileManager
      const exists = fileManager.exists(newPath)

      if (exists) {
        return modal('Create File Failed', 'File already exists', {
          label: 'Ok',
          fn: async () => {}
        }, null)
      } else {
        await fileManager.rename(oldPath, newPath)
        const files = replacePath(oldPath, newPath, state.files)

        setState(prevState => {
          return { ...prevState, files }
        })
      }
    } catch (error) {
      // modalDialogCustom.alert('Unexpected error while renaming: ' + error)
    }
  }

  const addFile = async (parentFolder: string, newFilePath: string, files?: File[]) => {
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
      const updatedFiles = await resolveDirectory(parentFolder, files || state.files)

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

  const addFolder = async (parentFolder: string, newFolderPath: string, files?: File[]) => {
    if (parentFolder === name) {
      setState(prevState => {
        return {
          ...prevState,
          files: [{
            path: newFolderPath,
            name: extractNameFromKey(newFolderPath),
            isDirectory: true
          }, ...prevState.files],
          focusElement: [{ key: newFolderPath, type: 'folder' }]
        }
      })
    } else {
      const updatedFiles = await resolveDirectory(parentFolder, files || state.files)

      setState(prevState => {
        return { ...prevState, files: updatedFiles, focusElement: [{ key: newFolderPath, type: 'folder' }] }
      })
    }
  }

  const addEmptyFolder = (parentFolder: string, files: File[]): File[] => {
    if (parentFolder === name) {
      files.unshift({
        path: 'browser/blank',
        name: '',
        isDirectory: true
      })
      return files
    }
    return files.map(file => {
      if (file.child) {
        if (file.path === parentFolder) {
          file.child = [{
            path: file.path + '/blank',
            name: '',
            isDirectory: true
          }, ...file.child]
          return file
        } else {
          file.child = addEmptyFolder(parentFolder, file.child)

          return file
        }
      } else {
        return file
      }
    })
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
  // props.filesProvider.event.register('fileRenamedError', (error) => {
  // //   modalDialogCustom.alert(error)
  // })

  // props.filesProvider.event.register('fileAdded', async (filePath: string) => {
  //   const pathArr = filePath.split('/')
  //   const hasChild = pathArr.length > 2

  //   if (hasChild) {
  //     const expandPath = pathArr.map((path, index) => {
  //       return [...pathArr.slice(0, index)].join('/')
  //     }).filter(path => path && (path !== name))

  //     if (state.files.findIndex(item => item.path === expandPath[0]) === -1) {
  //       const dir = buildTree(expandPath)
  //       let files = [dir, ...state.files]

  //       await Promise.all(expandPath.map(async path => {
  //         files = await resolveDirectory(path, files)
  //       }))
  //       setState(prevState => {
  //         return { ...prevState, files, expandPath: [...state.expandPath, ...expandPath] }
  //       })
  //     } else {
  //       console.log('called here again')
  //       console.log('expandPath[expandPath.length - 1]: ', expandPath[expandPath.length - 1])
  //       if (state.expandPath.findIndex(path => path === expandPath[expandPath.length - 1]) !== -1) return
  //       const dir = state.files.find(item => item.path === expandPath[0])
  //       let files = [{
  //         ...dir,
  //         child: [...(await fetchDirectoryContent(dir.path))]
  //       }, ...state.files.filter(item => item.path !== expandPath[0])]
  //       console.log('files: ', files)

  //       await Promise.all(expandPath.map(async path => {
  //         files = await resolveDirectory(path, files)
  //       }))
  //       const updatedPath = [state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(expandPath[0]))]

  //       setState(prevState => {
  //         return { ...prevState, files, expandPath: [...updatedPath, ...expandPath] }
  //       })
  //     }
  //   } else {
  //     addFile(pathArr[0], filePath)
  //   }
  // })

  // props.filesProvider.event.register('folderAdded', async (folderpath: string) => {
  //   const pathArr = folderpath.split('/')
  //   const hasChild = pathArr.length > 2

  //   if (hasChild) {
  //     const expandPath = pathArr.map((path, index) => {
  //       return [...pathArr.slice(0, index)].join('/')
  //     }).filter(path => path && (path !== name))

  //     if (state.files.findIndex(item => item.path === expandPath[0]) === -1) {
  //       const dir = buildTree(expandPath)
  //       let files = [dir, ...state.files]

  //       await Promise.all(expandPath.map(async path => {
  //         files = await resolveDirectory(path, files)
  //       }))
  //       setState(prevState => {
  //         return { ...prevState, files, expandPath: [...state.expandPath, ...expandPath] }
  //       })
  //     } else {
  //       if (state.files.findIndex(item => item.path === expandPath[expandPath.length - 1]) !== -1) return
  //       const dir = state.files.find(item => item.path === expandPath[0])
  //       let files = [{
  //         ...dir,
  //         child: [...(await fetchDirectoryContent(dir.path))]
  //       }, ...state.files.filter(item => item.path !== expandPath[0])]

  //       await Promise.all(expandPath.map(async path => {
  //         files = await resolveDirectory(path, files)
  //       }))
  //       const updatedPath = [state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(expandPath[0]))]

  //       setState(prevState => {
  //         return { ...prevState, files, expandPath: [...updatedPath, ...expandPath] }
  //       })
  //     }
  //   } else {
  //     addFolder(pathArr[0], folderpath)
  //   }
  // })

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modalOptions: { ...state.modalOptions, hide: true } }
    })
  }

  const modal = (title: string, message: string, ok: { label: string, fn: () => void }, cancel: { label: string, fn: () => void }) => {
    setState(prevState => {
      return {
        ...prevState,
        modalOptions: {
          ...prevState.modalOptions,
          hide: false,
          message,
          title,
          ok,
          cancel,
          handleHide: handleHideModal
        }
      }
    })
  }

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
      let expandPath = []

      if (!state.expandPath.includes(path)) {
        expandPath = [...state.expandPath, path]
      } else {
        expandPath = state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(path))
      }

      setState(prevState => {
        return { ...prevState, focusElement: [{ key: path, type: 'folder' }], files, expandPath }
      })
    }
  }

  const handleContextMenuFile = (pageX: number, pageY: number, path: string, content: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY }, focusEdit: { ...prevState.focusEdit, lastEdit: content } }
    })
  }

  const handleContextMenuFolder = (pageX: number, pageY: number, path: string, content: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY }, focusEdit: { ...prevState.focusEdit, lastEdit: content } }
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
      return { ...prevState, focusEdit: { ...prevState.focusEdit, element: path, isNew, type } }
    })
  }

  const editModeOff = async (content: string) => {
    const parentFolder = extractParentFromKey(state.focusEdit.element)

    if (!content || (content.trim() === '')) {
      if (state.focusEdit.isNew) {
        const files = removePath(state.focusEdit.element, state.files)
        const updatedFiles = files.filter(file => file)

        setState(prevState => {
          return { ...prevState, files: updatedFiles, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      } else {
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    } else {
      if (helper.checkSpecialChars(content)) {
        modal('Validation Error', 'Special characters are not allowed', {
          label: 'Ok',
          fn: () => {}
        }, null)
      } else {
        if (state.focusEdit.isNew) {
          state.focusEdit.type === 'file' ? createNewFile(parentFolder, parentFolder + '/' + content) : createNewFolder(parentFolder, parentFolder + '/' + content)
          const files = removePath(state.focusEdit.element, state.files)
          const updatedFiles = files.filter(file => file)

          setState(prevState => {
            return { ...prevState, files: updatedFiles }
          })
        } else {
          const oldPath: string = state.focusEdit.element
          const oldName = extractNameFromKey(oldPath)
          const newPath = oldPath.replace(oldName, content)

          renamePath(oldPath, newPath)
        }
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    }
  }

  const handleNewFileInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key : extractParentFromKey(state.focusElement[0].key) : name
    let files = await resolveDirectory(parentFolder, state.files)
    const expandPath = [...state.expandPath, parentFolder]

    files = addEmptyFile(parentFolder, files)
    setState(prevState => {
      return { ...prevState, files, expandPath }
    })
    editModeOn(parentFolder + '/blank', 'file', true)
  }

  const handleNewFolderInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key : extractParentFromKey(state.focusElement[0].key) : name
    else if ((parentFolder.indexOf('.sol') !== -1) || (parentFolder.indexOf('.js') !== -1)) parentFolder = extractParentFromKey(parentFolder)
    let files = await resolveDirectory(parentFolder, state.files)
    const expandPath = [...state.expandPath, parentFolder]

    files = addEmptyFolder(parentFolder, state.files)
    setState(prevState => {
      return { ...prevState, files, expandPath }
    })
    editModeOn(parentFolder + '/blank', 'folder', true)
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
            iconX='pr-3 fa fa-folder text-info'
            iconY='pr-3 fa fa-folder-open text-info'
            key={`${file.path + index}`}
            label={label(file)}
            onClick={(e) => {
              e.stopPropagation()
              handleClickFolder(file.path)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleContextMenuFolder(e.pageX, e.pageY, file.path, e.target.textContent)
            }}
            labelClass={ state.focusEdit.element === file.path ? 'bg-light' : state.focusElement.findIndex(item => item.key === file.path) !== -1 ? 'bg-secondary' : '' }
            editable={state.focusEdit.element === file.path}
            onBlur={(value) => editModeOff(value)}
            controlBehaviour={ state.ctrlKey }
            expand={state.expandPath.includes(file.path)}
          >
            {
              file.child ? <TreeView id={`treeView${file.path}`} key={index}>{
                file.child.map((file, index) => {
                  return renderFiles(file, index)
                })
              }
              </TreeView> : <TreeView id={`treeView${file.path}`} key={index} />
            }
          </TreeViewItem>
          { ((state.focusContext.element === file.path) && (state.focusEdit.element !== file.path)) &&
            <FileExplorerContextMenu
              actions={state.actions}
              hideContextMenu={hideContextMenu}
              createNewFile={handleNewFileInput}
              createNewFolder={handleNewFolderInput}
              deletePath={deletePath}
              renamePath={editModeOn}
              pageX={state.focusContext.x}
              pageY={state.focusContext.y}
              path={file.path}
              type='folder'
            />
          }
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
              handleContextMenuFile(e.pageX, e.pageY, file.path, e.target.textContent)
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
              createNewFolder={handleNewFolderInput}
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
    <div>
      <TreeView id='treeView'>
        <TreeViewItem id="treeViewItem"
          label={
            <FileExplorerMenu
              title={name}
              menuItems={props.menuItems}
              addFile={addFile}
              createNewFile={handleNewFileInput}
              createNewFolder={handleNewFolderInput}
              files={filesProvider}
              fileManager={state.fileManager}
              accessToken={state.accessToken}
            />
          }
          expand={true}>
          <div className='pb-2'>
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
      <ModalDialog
        title={ state.modalOptions.title }
        message={ state.modalOptions.message }
        hide={ state.modalOptions.hide }
        ok={ state.modalOptions.ok }
        cancel={ state.modalOptions.cancel }
        handleHide={ handleHideModal }
      />
    </div>
  )
}

export default FileExplorer
