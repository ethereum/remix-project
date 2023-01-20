import React, { useEffect, useState, useRef, SyntheticEvent } from 'react' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, MenuItems, FileExplorerState } from '../types'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { contextMenuActions } from '../utils'
const parser = (window as any).SolidityParser
import { convertUmlClasses2Dot } from 'sol2uml/lib/converterClasses2Dot'
import vizRenderStringSync from '@aduh95/viz.js/sync'
import domToPdf from 'dom-to-pdf'
import { jsPDF } from 'jspdf'
import { convertAST2UmlClasses } from 'sol2uml/lib/converterAST2Classes'
import { createClient } from '@remixproject/plugin-webview'


import '../css/file-explorer.css'
import { checkSpecialChars, extractNameFromKey, extractParentFromKey, joinPath } from '@remix-ui/helper'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileRender } from './file-render'
import { Drag } from "@remix-ui/drag-n-drop"
import { ROOT_PATH } from '../utils/constants'
import { IRemixApi } from '@remixproject/plugin-api'
import { concatSourceFiles, getDependencyGraph } from '@remix-ui/solidity-compiler'


export const FileExplorer = (props: FileExplorerProps) => {
  const { name, contextMenuItems, removedContextMenuItems, files, fileState, plugin } = props
  const [state, setState] = useState<FileExplorerState>({
    ctrlKey: false,
    newFileName: '',
    actions: contextMenuActions,
    focusContext: {
      element: null,
      x: null,
      y: null,
      type: ''
    },
    focusEdit: {
      element: null,
      type: '',
      isNew: false,
      lastEdit: ''
    },
    mouseOverElement: null,
    showContextMenu: false,
    reservedKeywords: [ROOT_PATH, 'gist-'],
    copyElement: []
  })
  const [canPaste, setCanPaste] = useState(false)
  const treeRef = useRef<HTMLDivElement>(null)
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [svgPayload, setSVGPayload] = useState('')
  const [showViewer, setShowViewer] = useState(false)
  const [contentForAST, setContentForAST] = useState('')

  
  useEffect(() => {
    if (contextMenuItems) {
      addMenuItems(contextMenuItems)
    }
  }, [contextMenuItems])

  useEffect(() => {
    if (removedContextMenuItems) {
      removeMenuItems(removedContextMenuItems)
    }
  }, [contextMenuItems])

  useEffect(() => {
    if (props.focusEdit) {
      setState(prevState => {
        return { ...prevState, focusEdit: { element: props.focusEdit, type: 'file', isNew: true, lastEdit: null } }
      })
    }
  }, [props.focusEdit])

  useEffect(() => {
    if (treeRef.current) {
      const keyPressHandler = (e: KeyboardEvent) => {
        if (e.shiftKey) {
          setState(prevState => {
            return { ...prevState, ctrlKey: true }
          })
        }
      }
  
      const keyUpHandler = (e: KeyboardEvent) => {
        if (!e.shiftKey) {
          setState(prevState => {
            return { ...prevState, ctrlKey: false }
          })
        }
      }
      const targetDocument = treeRef.current
  
      targetDocument.addEventListener('keydown', keyPressHandler)
      targetDocument.addEventListener('keyup', keyUpHandler)
      return () => {
        targetDocument.removeEventListener('keydown', keyPressHandler)
        targetDocument.removeEventListener('keyup', keyUpHandler)
      }
    }
  }, [treeRef.current])

  useEffect(() => {
    if (canPaste) {
      addMenuItems([{
        id: 'paste',
        name: 'Paste',
        type: ['folder', 'file'],
        path: [],
        extension: [],
        pattern: [],
        multiselect: false,
        label: ''
      }])
    } else {
      removeMenuItems([{
        id: 'paste',
        name: 'Paste',
        type: ['folder', 'file'],
        path: [],
        extension: [],
        pattern: [],
        multiselect: false,
        label: ''
      }])
    }
  }, [canPaste])

  const addMenuItems = (items: MenuItems) => {
    setState(prevState => {
      // filter duplicate items
      const actions = items.filter(({ name }) => prevState.actions.findIndex(action => action.name === name) === -1)

      return { ...prevState, actions: [...prevState.actions, ...actions] }
    })
  }

  const removeMenuItems = (items: MenuItems) => {
    setState(prevState => {
      const actions = prevState.actions.filter(({ id, name }) => items.findIndex(item => id === item.id && name === item.name) === -1)
      return { ...prevState, actions }
    })
  }

  const hasReservedKeyword = (content: string): boolean => {
    if (state.reservedKeywords.findIndex(value => content.startsWith(value)) !== -1) return true
    else return false
  }

  const getFocusedFolder = () => {
    if (props.focusElement[0]) {
      if (props.focusElement[0].type === 'folder' && props.focusElement[0].key) return props.focusElement[0].key
      else if (props.focusElement[0].type === 'gist' && props.focusElement[0].key) return props.focusElement[0].key
      else if (props.focusElement[0].type === 'file' && props.focusElement[0].key) return extractParentFromKey(props.focusElement[0].key) ? extractParentFromKey(props.focusElement[0].key) : ROOT_PATH
      else return ROOT_PATH
    }
  }

  const createNewFile = async (newFilePath: string) => {
    try {
      props.dispatchCreateNewFile(newFilePath, ROOT_PATH)
    } catch (error) {
      return props.modal('File Creation Failed', typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    try {
      props.dispatchCreateNewFolder(newFolderPath, ROOT_PATH)
    } catch (e) {
      return props.modal('Folder Creation Failed', typeof e === 'string' ? e : e.message, 'Close', async () => {})
    }
  }

  const deletePath = async (path: string[]) => {
    if (props.readonly) return props.toast('cannot delete file. ' + name + ' is a read only explorer')
    if (!Array.isArray(path)) path = [path]

    props.modal(`Delete ${path.length > 1 ? 'items' : 'item'}`, deleteMessage(path), 'OK', () => { props.dispatchDeletePath(path) }, 'Cancel', () => {})
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      props.dispatchRenamePath(oldPath, newPath)
    } catch (error) {
      props.modal('Rename File Failed', 'Unexpected error while renaming: ' + typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const uploadFile = (target) => {
    const parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...props.expandPath, parentFolder])]

    props.dispatchHandleExpandPath(expandPath)
    props.dispatchUploadFile(target, parentFolder)
  }

  const copyFile = (src: string, dest: string) => {
    try {
      props.dispatchCopyFile(src, dest)
    } catch (error) {
      props.modal('Copy File Failed', 'Unexpected error while copying file: ' + src, 'Close', async () => {})
    }
  }

  const copyFolder = (src: string, dest: string) => {
    try {
      props.dispatchCopyFolder(src, dest)
    } catch (error) {
      props.modal('Copy Folder Failed', 'Unexpected error while copying folder: ' + src, 'Close', async () => {})
    }
  }

  const publishToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${name} workspace as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const pushChangesToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', 'Are you sure you want to push changes to remote gist file on github.com?', 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const publishFolderToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${path} folder as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const publishFileToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', `Are you sure you want to anonymously publish ${path} file as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const toGist = (path?: string, type?: string) => {
    props.dispatchPublishToGist(path, type)
  }

  const runScript = async (path: string) => {
    try {
      props.dispatchRunScript(path)
    } catch (error) {
      props.toast('Run script failed')
    }
  }

  const emitContextMenuEvent = (cmd: customAction) => {
    try {
      props.dispatchEmitContextMenuEvent(cmd)
    } catch (error) {
      props.toast(error)
    }
  }

  const handleClickFile = (path: string, type: 'folder' | 'file' | 'gist') => {
    if (!state.ctrlKey) {
      props.dispatchHandleClickFile(path, type)
    } else {
      if (props.focusElement.findIndex(item => item.key === path) !== -1) {
        const focusElement = props.focusElement.filter(item => item.key !== path)

        props.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = props.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

        nonRootFocus.push({ key: path, type })
        props.dispatchSetFocusElement(nonRootFocus)
      }
    }
  }

  const handleClickFolder = async (path: string, type: 'folder' | 'file' | 'gist') => {
    if (state.ctrlKey) {
      if (props.focusElement.findIndex(item => item.key === path) !== -1) {
        const focusElement = props.focusElement.filter(item => item.key !== path)

        props.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = props.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

        nonRootFocus.push({ key: path, type })
        props.dispatchSetFocusElement(nonRootFocus)
      }
    } else {
      let expandPath = []

      if (!props.expandPath.includes(path)) {
        expandPath = [...new Set([...props.expandPath, path])]
        props.dispatchFetchDirectory(path)
      } else {
        expandPath = [...new Set(props.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(path)))]
      }

      props.dispatchSetFocusElement([{ key: path, type }])
      props.dispatchHandleExpandPath(expandPath)
    }
  }

  const handleContextMenu = (pageX: number, pageY: number, path: string, content: string, type: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY, type }, focusEdit: { ...prevState.focusEdit, lastEdit: content }, showContextMenu: prevState.focusEdit.element !== path }
    })
  }

  const hideContextMenu = () => {
    setState(prevState => {
      return { ...prevState, focusContext: { element: null, x: 0, y: 0, type: '' }, showContextMenu: false }
    })
  }

  const editModeOn = (path: string, type: string, isNew = false) => {
    if (props.readonly) return props.toast('Cannot write/modify file system in read only mode.')
    setState(prevState => {
      return { ...prevState, focusEdit: { ...prevState.focusEdit, element: path, isNew, type } }
    })
  }

  const editModeOff = async (content: string) => {
    if (typeof content === 'string') content = content.trim()
    const parentFolder = extractParentFromKey(state.focusEdit.element)

    if (!content || (content.trim() === '')) {
      if (state.focusEdit.isNew) {
        props.dispatchRemoveInputField(parentFolder)
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      } else {
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    } else {
      if (state.focusEdit.lastEdit === content) {
        return setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
      if (checkSpecialChars(content)) {
        props.modal('Validation Error', 'Special characters are not allowed', 'OK', () => {})
      } else {
        if (state.focusEdit.isNew) {
          if (hasReservedKeyword(content)) {
            props.dispatchRemoveInputField(parentFolder)
            props.modal('Reserved Keyword', `File name contains Remix reserved keywords. '${content}'`, 'Close', () => {})
          } else {
            state.focusEdit.type === 'file' ? createNewFile(joinPath(parentFolder, content)) : createNewFolder(joinPath(parentFolder, content))
            props.dispatchRemoveInputField(parentFolder)
          }
        } else {
          if (hasReservedKeyword(content)) {
            props.modal('Reserved Keyword', `File name contains Remix reserved keywords. '${content}'`, 'Close', () => {})
          } else {
            if (state.focusEdit.element) {
              const oldPath: string = state.focusEdit.element
              const oldName = extractNameFromKey(oldPath)
              const newPath = oldPath.replace(oldName, content)

              renamePath(oldPath, newPath)
            }
          }
        }
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    }
  }

  const handleNewFileInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...props.expandPath, parentFolder])]

    await props.dispatchAddInputField(parentFolder, 'file')
    props.dispatchHandleExpandPath(expandPath)
    editModeOn(parentFolder + '/blank', 'file', true)
  }

  const handleNewFolderInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    else if ((parentFolder.indexOf('.sol') !== -1) || (parentFolder.indexOf('.js') !== -1)) parentFolder = extractParentFromKey(parentFolder)
    const expandPath = [...new Set([...props.expandPath, parentFolder])]

    await props.dispatchAddInputField(parentFolder, 'folder')
    props.dispatchHandleExpandPath(expandPath)
    editModeOn(parentFolder + '/blank', 'folder', true)
  }

  const handleCopyClick = (path: string, type: 'folder' | 'gist' | 'file') => {
    setState(prevState => {
      return { ...prevState, copyElement: [{ key: path, type }] }
    })
    setCanPaste(true)
    props.toast(`Copied to clipboard ${path}`)
  }

  const handlePasteClick = (dest: string, destType: string) => {
    dest = destType === 'file' ? extractParentFromKey(dest) || ROOT_PATH : dest
    state.copyElement.map(({ key, type }) => {
      type === 'file' ? copyFile(key, dest) : copyFolder(key, dest)
    })
  }

  const deleteMessage = (path: string[]) => {
    return (
      <div>
        <div>Are you sure you want to delete {path.length > 1 ? 'these items' : 'this item'}?</div>
        {
          path.map((item, i) => (<li key={i}>{item}</li>))
        }
      </div>
    )
  }

  const handleFileExplorerMenuClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerUploadFileuploadFile') return // we don't want to let propagate the input of type file
    if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerFileUpload') return // we don't want to let propagate the input of type file
    let expandPath = []

    if (!props.expandPath.includes(ROOT_PATH)) {
      expandPath = [ROOT_PATH, ...new Set([...props.expandPath])]
    } else {
      expandPath = [...new Set(props.expandPath.filter(key => key && (typeof key === 'string')))]
    }
    props.dispatchHandleExpandPath(expandPath)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyFileNameClick = (path: string, _type: string) => {
    const fileName = extractNameFromKey(path)
    navigator.clipboard.writeText(fileName)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyFilePathClick = (path: string, _type: string) => {
    navigator.clipboard.writeText(path)
  }

  const handleFileMove = (dest: string, src: string) => {
    try {
      props.dispatchMoveFile(src, dest)
    } catch (error) {
      props.modal('Moving File Failed', 'Unexpected error while moving file: ' + src, 'Close', async () => {})
    }   
  }

  const handleFolderMove = (dest: string, src: string) => {
    try {
      props.dispatchMoveFolder(src, dest)
    } catch (error) {
      props.modal('Moving Folder Failed', 'Unexpected error while moving folder: ' + src, 'Close', async () => {})
    }   
  }

  /**
   * Take AST and generates a UML diagram of compiled contract as svg
   * @returns void
   */
  const generateUml = (path: string) => {
    try {
      const currentFile = path
      let ast: any
      plugin.call('solidity', 'compile', path)
      plugin.on('solidity', 'compilationFinished', (file, source, languageVersion, data, input, version) => {
      console.log({
          file, source, languageVersion, data, input, version
        })
        if (data.sources && Object.keys(data.sources).length > 1) { // we should flatten first as there are multiple asts
          flattenContract(source, currentFile, data)
        }
        ast = contentForAST.length > 1 ? parser.parse(contentForAST) : parser.parse(source.sources[currentFile].content)
        const payload = vizRenderStringSync(convertUmlClasses2Dot(convertAST2UmlClasses(ast, currentFile)))
        console.log({ payload })
        const fileName = `${currentFile.split('/')[0]}/resources/${currentFile.split('/')[1].split('.')[0]}.svg`
        plugin.call('fileManager', 'writeFile', fileName, payload)
        plugin.call('fileManager', 'open', fileName)
        setSVGPayload(payload)
      })
      
      // const element = new DOMParser().parseFromString(payload, 'image/svg+xml')
      // .querySelector('svg')
      // domToPdf(element, { filename: `${currentFile.split('/')[1].split('.')[0]}.pdf`, scale: 1.2 }, (pdf: jsPDF) => {
        
      //   // api.writeFile(fileName, pdf.output())
      // })
      // setShowViewer(!showViewer)
    } catch (error) {
      console.log({ error })
    }
  }

  /**
   * Takes currently compiled contract that has a bunch of imports at the top
   * and flattens them ready for UML creation. Takes the flattened result
   * and assigns to a local property
   * @returns void
   */
  const flattenContract = (source: any, filePath: string, data: any) => {
    const ast = data.sources
    const dependencyGraph = getDependencyGraph(ast, filePath)
    const sorted = dependencyGraph.isEmpty()
        ? [filePath]
        : dependencyGraph.sort().reverse()
    const sources = source.sources
    const result = concatSourceFiles(sorted, sources)
    plugin.call('fileManager', 'writeFile', `${filePath}_flattened.sol`, result)
    setContentForAST(result)
  }
  return (
    <Drag onFileMoved={handleFileMove} onFolderMoved={handleFolderMove}>
    <div ref={treeRef} tabIndex={0} style={{ outline: "none" }}>
      <TreeView id='treeView'>
        <TreeViewItem id="treeViewItem"
          controlBehaviour={true}
          label={
            <div onClick={handleFileExplorerMenuClick}>
              <FileExplorerMenu
                title={''}
                menuItems={props.menuItems}
                createNewFile={handleNewFileInput}
                createNewFolder={handleNewFolderInput}
                publishToGist={publishToGist}
                uploadFile={uploadFile}
              />
            </div>
          }
          expand={true}>
          <div className='pb-4 mb-4'>
            <TreeView id='treeViewMenu'>
              {
                files[ROOT_PATH] && Object.keys(files[ROOT_PATH]).map((key, index) => <FileRender
                  file={files[ROOT_PATH][key]}
                  fileDecorations={fileState}
                  index={index}
                  focusContext={state.focusContext}
                  focusEdit={state.focusEdit}
                  focusElement={props.focusElement}
                  ctrlKey={state.ctrlKey}
                  expandPath={props.expandPath}
                  editModeOff={editModeOff}
                  handleClickFile={handleClickFile}
                  handleClickFolder={handleClickFolder}
                  handleContextMenu={handleContextMenu}
                  key={index}
                  showIconsMenu={props.showIconsMenu}
                  hideIconsMenu={props.hideIconsMenu}
                  
                />)
              }
            </TreeView>
          </div>
        </TreeViewItem>
      </TreeView>
      { state.showContextMenu &&
        <FileExplorerContextMenu
          actions={props.focusElement.length > 1 ? state.actions.filter(item => item.multiselect) : state.actions.filter(item => !item.multiselect)}
          hideContextMenu={hideContextMenu}
          createNewFile={handleNewFileInput}
          createNewFolder={handleNewFolderInput}
          deletePath={deletePath}
          renamePath={editModeOn}
          runScript={runScript}
          copy={handleCopyClick}
          paste={handlePasteClick}
          copyFileName={handleCopyFileNameClick}
          copyPath={handleCopyFilePathClick}
          emit={emitContextMenuEvent}
          pageX={state.focusContext.x}
          pageY={state.focusContext.y}
          path={state.focusContext.element}
          type={state.focusContext.type}
          focus={props.focusElement}
          pushChangesToGist={pushChangesToGist}
          publishFolderToGist={publishFolderToGist}
          publishFileToGist={publishFileToGist}
          generateUml={generateUml}
        />
      }
    </div>
    </Drag>
  )
}

export default FileExplorer
