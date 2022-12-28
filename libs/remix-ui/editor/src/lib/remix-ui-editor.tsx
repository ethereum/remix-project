import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line

import Editor, { DiffEditor, loader, Monaco } from '@monaco-editor/react'
import { AlertModal } from '@remix-ui/app'
import { reducerActions, reducerListener, initialState } from './actions/editor'
import { solidityTokensProvider, solidityLanguageConfig } from './syntaxes/solidity'
import { cairoTokensProvider, cairoLanguageConfig } from './syntaxes/cairo'
import { zokratesTokensProvider, zokratesLanguageConfig } from './syntaxes/zokrates'
import { moveTokenProvider, moveLanguageConfig } from './syntaxes/move'

import './remix-ui-editor.css'
import { loadTypes } from './web-types'
import monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { IMarkdownString, IPosition, MarkerSeverity } from 'monaco-editor'

import { RemixHoverProvider } from './providers/hoverProvider'
import { RemixReferenceProvider } from './providers/referenceProvider'
import { RemixCompletionProvider } from './providers/completionProvider'
import { RemixHighLightProvider } from './providers/highlightProvider'
import { RemixDefinitionProvider } from './providers/definitionProvider'
import { convertToMonacoDecoration, defineAndSetTheme } from './utils'
import { errorMarker, sourceAnnotation, sourceMarker } from './types'



loader.config({ paths: { vs: 'assets/js/monaco-editor/dev/vs' } })

export type DecorationsReturn = {
  currentDecorations: Array<string>
  registeredDecorations?: Array<any>
}

/* eslint-disable-next-line */
export interface EditorUIProps {
  contextualListener: any
  activated: boolean
  themeType: string
  currentFile: string
  events: {
    onBreakPointAdded: (file: string, line: number) => void
    onBreakPointCleared: (file: string, line: number) => void
    onDidChangeContent: (file: string) => void
    onEditorMounted: () => void
    onDiffEditorMounted: () => void
  }
  plugin: {
    on: (plugin: string, event: string, listener: any) => void
    call: (plugin: string, method: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any) => any
  }
  editorAPI: {
    findMatches: (uri: string, value: string) => any
    getFontSize: () => number,
    getValue: (uri: string) => string
    getCursorPosition: (offset?: boolean) => number | IPosition
    getHoverPosition: (position: IPosition) => number
    addDecoration: (marker: sourceMarker, filePath: string, typeOfDecoration: string) => DecorationsReturn
    clearDecorationsByPlugin: (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => DecorationsReturn
    keepDecorationsFor: (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => DecorationsReturn
    addErrorMarker: (errors: errorMarker[], from: string) => void
    clearErrorMarkers: (sources: string[] | {[fileName: string]: any}, from: string) => void
  }
}
export const EditorUI = (props: EditorUIProps) => {
  const [, setCurrentBreakpoints] = useState({})
  const defaultEditorValue = `
  \t\t\t\t\t\t\t ____    _____   __  __   ___  __  __   ___   ____    _____ 
  \t\t\t\t\t\t\t|  _ \\  | ____| |  \\/  | |_ _| \\ \\/ /  |_ _| |  _ \\  | ____|
  \t\t\t\t\t\t\t| |_) | |  _|   | |\\/| |  | |   \\  /    | |  | | | | |  _|  
  \t\t\t\t\t\t\t|  _ <  | |___  | |  | |  | |   /  \\    | |  | |_| | | |___ 
  \t\t\t\t\t\t\t|_| \\_\\ |_____| |_|  |_| |___| /_/\\_\\  |___| |____/  |_____|\n\n
  \t\t\t\t\t\t\tKeyboard Shortcuts:\n
  \t\t\t\t\t\t\t\tCTRL + S: Compile the current contract\n
  \t\t\t\t\t\t\t\tCTRL + Shift + F : Open the File Explorer\n
  \t\t\t\t\t\t\t\tCTRL + Shift + A : Open the Plugin Manager\n
  \t\t\t\t\t\t\t\tCTRL + SHIFT + S: Compile the current contract & Run an associated script\n
  \t\t\t\t\t\t\tEditor Keyboard Shortcuts:\n
  \t\t\t\t\t\t\t\tCTRL + Alt + F : Format the code in the current file\n
  \t\t\t\t\t\t\tImportant Links:\n
  \t\t\t\t\t\t\t\tOfficial website about the Remix Project: https://remix-project.org/\n
  \t\t\t\t\t\t\t\tOfficial documentation: https://remix-ide.readthedocs.io/en/latest/\n
  \t\t\t\t\t\t\t\tGithub: https://github.com/ethereum/remix-project\n
  \t\t\t\t\t\t\t\tGitter: https://gitter.im/ethereum/remix\n
  \t\t\t\t\t\t\t\tMedium: https://medium.com/remix-ide\n
  \t\t\t\t\t\t\t\tTwitter: https://twitter.com/ethereumremix\n
  `
  const pasteCodeRef = useRef(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null)
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor>(null)
  const monacoRef = useRef<Monaco>(null)
  const currentFileRef = useRef('')
  const currentUrlRef = useRef('')
  // const currentDecorations = useRef({ sourceAnnotationsPerFile: {}, markerPerFile: {} }) // decorations that are currently in use by the editor
  // const registeredDecorations = useRef({}) // registered decorations

  const [editorModelsState, dispatch] = useReducer(reducerActions, initialState)



  useEffect(() => {
    if (!monacoRef.current) return
    defineAndSetTheme(monacoRef, props.themeType)
  })

  useEffect(() => {
    if (!(editorRef.current || diffEditorRef.current)  || !props.currentFile) return
    currentFileRef.current = props.currentFile
    props.plugin.call('fileManager', 'getUrlFromPath', currentFileRef.current).then((url) => currentUrlRef.current = url.file)

    const file = editorModelsState[props.currentFile]
    console.log('file', file)
    editorRef && editorRef.current && editorRef.current.setModel(file.model)
    diffEditorRef && diffEditorRef.current && diffEditorRef.current.setModel({
      original: file.model,
      modified: file.model
    })
    getEditor().updateOptions({ readOnly: editorModelsState[props.currentFile].readOnly })
    
    if (file.language === 'sol') {
      monacoRef.current.editor.setModelLanguage(file.model, 'remix-solidity')
    } else if (file.language === 'cairo') {
      monacoRef.current.editor.setModelLanguage(file.model, 'remix-cairo')
    } else if (file.language === 'zokrates') {
      monacoRef.current.editor.setModelLanguage(file.model, 'remix-zokrates')
    } else if (file.language === 'move') {
      monacoRef.current.editor.setModelLanguage(file.model, 'remix-move')
    }
  }, [props.currentFile])

  const getEditor = () => {
    if(editorRef.current) return editorRef.current
    if(diffEditorRef.current) return diffEditorRef.current.getModifiedEditor()
  }

  props.editorAPI.clearDecorationsByPlugin = (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => {
    const model = editorModelsState[filePath]?.model
    if (!model) return {
      currentDecorations: [],
      registeredDecorations: []
    }
    const decorations = []
    const newRegisteredDecorations = []
    if (registeredDecorations) {
      for (const decoration of registeredDecorations) {
        if (decoration.type === typeOfDecoration && decoration.value.from !== plugin) {
          decorations.push(convertToMonacoDecoration(decoration.value, typeOfDecoration, monacoRef))
          newRegisteredDecorations.push(decoration)
        }
      }
    }
    return {
      currentDecorations: model.deltaDecorations(currentDecorations, decorations),
      registeredDecorations: newRegisteredDecorations
    }
  }

  props.editorAPI.keepDecorationsFor = (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => {
    const model = editorModelsState[filePath]?.model
    if (!model) return {
      currentDecorations: []
    }
    const decorations = []
    if (registeredDecorations) {
      for (const decoration of registeredDecorations) {
        if (decoration.value.from === plugin) {
          decorations.push(convertToMonacoDecoration(decoration.value, typeOfDecoration, monacoRef))
        }
      }
    }
    return {
      currentDecorations: model.deltaDecorations(currentDecorations, decorations)
    }
  }

  const addDecoration = (decoration: sourceAnnotation | sourceMarker, filePath: string, typeOfDecoration: string) => {
    const model = editorModelsState[filePath]?.model
    if (!model) return { currentDecorations: [] }
    const monacoDecoration = convertToMonacoDecoration(decoration, typeOfDecoration, monacoRef)
    return {
      currentDecorations: model.deltaDecorations([], [monacoDecoration]),
      registeredDecorations: [{ value: decoration, type: typeOfDecoration }]
    }
  }

  props.editorAPI.addDecoration = (marker: sourceMarker, filePath: string, typeOfDecoration: string) => {
    return addDecoration(marker, filePath, typeOfDecoration)
  }

  props.editorAPI.addErrorMarker = async (errors: errorMarker[], from: string) => {

    const allMarkersPerfile: Record<string, Array<monaco.editor.IMarkerData>> = {}

    for (const error of errors) {
      let filePath = error.file

      if (!filePath) return
      const fileFromUrl = await props.plugin.call('fileManager', 'getPathFromUrl', filePath)
      filePath = fileFromUrl.file
      const model = editorModelsState[filePath]?.model
      const errorServerityMap = {
        'error': MarkerSeverity.Error,
        'warning': MarkerSeverity.Warning,
        'info': MarkerSeverity.Info
      }
      if (model) {
        const markerData: monaco.editor.IMarkerData = {
          severity: (typeof error.severity === 'string') ? errorServerityMap[error.severity] : error.severity,
          startLineNumber: ((error.position.start && error.position.start.line) || 0),
          startColumn: ((error.position.start && error.position.start.column) || 0),
          endLineNumber: ((error.position.end && error.position.end.line) || 0),
          endColumn: ((error.position.end && error.position.end.column) || 0),
          message: error.message,
        }
        if (!allMarkersPerfile[filePath]) {
          allMarkersPerfile[filePath] = []
        }
        allMarkersPerfile[filePath].push(markerData)
      }
    }
    for (const filePath in allMarkersPerfile) {
      const model = editorModelsState[filePath]?.model
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, from, allMarkersPerfile[filePath])
      }
    }
  }

  props.editorAPI.clearErrorMarkers = async (sources: string[] | {[fileName: string]: any}, from: string) => {
    if (sources) {
      for (const source of (Array.isArray(sources) ? sources : Object.keys(sources))) {
        const filePath = source
        const model = editorModelsState[filePath]?.model
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, from, [])
        }
      }
    }
  }

  props.editorAPI.findMatches = (uri: string, value: string) => {
    if (!editorRef.current) return
    const model = editorModelsState[uri]?.model
    if (model) return model.findMatches(value)
  }

  props.editorAPI.getValue = (uri: string) => {
    if (!editorRef.current) return
    const model = editorModelsState[uri]?.model
    if (model) {
      return model.getValue()
    }
  }

  props.editorAPI.getCursorPosition = (offset:boolean = true) => {
    if (!monacoRef.current) return
    const model = editorModelsState[currentFileRef.current]?.model
    if (model) {
      return offset? model.getOffsetAt(getEditor().getPosition()): getEditor().getPosition()
    }
  }

  props.editorAPI.getHoverPosition = (position: monaco.Position) => {
    if (!monacoRef.current) return
    const model = editorModelsState[currentFileRef.current]?.model
    if (model) {
      return model.getOffsetAt(position)
    } else {
      return 0
    }
  }

  props.editorAPI.getFontSize = () => {
    if (!editorRef.current) return
    return getEditor().getOption(43).fontSize
  }

  (window as any).addRemixBreakpoint = (position) => { // make it available from e2e testing...
    const model = getEditor().getModel()
    if (model) {
      setCurrentBreakpoints(prevState => {
        const currentFile = currentUrlRef.current
        if (!prevState[currentFile]) prevState[currentFile] = {}
        const decoration = Object.keys(prevState[currentFile]).filter((line) => parseInt(line) === position.lineNumber)
        if (decoration.length) {
          props.events.onBreakPointCleared(currentFile, position.lineNumber)
          model.deltaDecorations([prevState[currentFile][position.lineNumber]], [])
          delete prevState[currentFile][position.lineNumber]
        } else {
          props.events.onBreakPointAdded(currentFile, position.lineNumber)
          const decorationIds = model.deltaDecorations([], [{
            range: new monacoRef.current.Range(position.lineNumber, 1, position.lineNumber, 1),
            options: {
              isWholeLine: false,
              glyphMarginClassName: 'fas fa-circle text-info'
            }
          }])
          prevState[currentFile][position.lineNumber] = decorationIds[0]
        }
        return prevState
      })
    }
  }

  function handleDiffEditorDidMount(editor: monaco.editor.IStandaloneDiffEditor) {
    console.log('diff editor mounted', editor)
    diffEditorRef.current = editor
    defineAndSetTheme(monacoRef, props.themeType)
    reducerListener(props.plugin, dispatch, monacoRef.current, diffEditorRef.current.getModifiedEditor(), props.events)
    props.events.onEditorMounted()
  }

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    console.log('editor mounted', editor)
    editorRef.current = editor
    defineAndSetTheme(monacoRef, props.themeType)
    reducerListener(props.plugin, dispatch, monacoRef.current, editorRef.current, props.events)
    props.events.onEditorMounted()
    
    
    editor.onMouseUp((e) => {
      if (e && e.target && e.target.toString().startsWith('GUTTER')) {
        (window as any).addRemixBreakpoint(e.target.position)
      }
    })
    
    
    editor.onDidPaste((e) => {
       if (!pasteCodeRef.current && e && e.range && e.range.startLineNumber >= 0 && e.range.endLineNumber >= 0 && e.range.endLineNumber - e.range.startLineNumber > 10) {
        const modalContent: AlertModal = {
          id: 'newCodePasted',
          title: 'Pasted Code Alert',
          message: (
            <div> <i className="fas fa-exclamation-triangle text-danger mr-1"></i>
              You have just pasted a code snippet or contract in the editor.
              <div>
                Make sure you fully understand this code before deploying or interacting with it. Don't get scammed!
                <div className='mt-2'>
                Running untrusted code can put your wallet <span className='text-warning'> at risk </span>. In a worst-case scenario, you could <span className='text-warning'>lose all your money</span>.
                </div>
                <div className='text-warning  mt-2'>If you don't fully understand it, please don't run this code.</div>
                <div className='mt-2'>
                If you are not a smart contract developer, ask someone you trust who has the skills to determine if this code is safe to use.
                </div>
                <div className='mt-2'>See <a target="_blank" href='https://remix-ide.readthedocs.io/en/latest/security.html'> these recommendations </a> for more information.</div>
              </div>
            </div>
          ),
        }
        props.plugin.call('notification', 'alert', modalContent)
        pasteCodeRef.current = true
      }
    })
    
    

    // zoomin zoomout
    editor.addCommand(monacoRef.current.KeyMod.CtrlCmd | (monacoRef.current.KeyCode as any).US_EQUAL, () => {
      editor.updateOptions({ fontSize: editor.getOption(43).fontSize + 1 })
    })
    editor.addCommand(monacoRef.current.KeyMod.CtrlCmd | (monacoRef.current.KeyCode as any).US_MINUS, () => {
      editor.updateOptions({ fontSize: editor.getOption(43).fontSize - 1 })
    })

    // add context menu items
    const zoominAction = {
      id: "zoomIn",
      label: "Zoom In",
      contextMenuOrder: 0, // choose the order
      contextMenuGroupId: "zooming", // create a new grouping
      keybindings: [
        // eslint-disable-next-line no-bitwise
        monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.Equal,
      ],
      run: () => { editor.updateOptions({ fontSize: editor.getOption(43).fontSize + 1 }) },
    }
    const zoomOutAction = {
      id: "zoomOut",
      label: "Zoom Out",
      contextMenuOrder: 0, // choose the order
      contextMenuGroupId: "zooming", // create a new grouping
      keybindings: [
        // eslint-disable-next-line no-bitwise
        monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.Minus,
      ],
      run: () => { editor.updateOptions({ fontSize: editor.getOption(43).fontSize - 1 }) },
    }
    const formatAction = {
      id: "autoFormat",
      label: "Format Code",
      contextMenuOrder: 0, // choose the order
      contextMenuGroupId: "formatting", // create a new grouping
      keybindings: [
        // eslint-disable-next-line no-bitwise
        monacoRef.current.KeyMod.Shift | monacoRef.current.KeyMod.Alt | monacoRef.current.KeyCode.KeyF,
      ],
      run: async () => { 
        const file = await props.plugin.call('fileManager', 'getCurrentFile')
        await props.plugin.call('codeFormatter', 'format', file)
      },
    }
    editor.addAction(formatAction)
    editor.addAction(zoomOutAction)
    editor.addAction(zoominAction)
    const editorService = (editor as any)._codeEditorService;
    const openEditorBase = editorService.openCodeEditor.bind(editorService);
    editorService.openCodeEditor = async (input , source) => {
      const result = await openEditorBase(input, source)
      if (input && input.resource && input.resource.path) {
        try {
          await props.plugin.call('fileManager', 'open', input.resource.path)
          if (input.options && input.options.selection) {
            editor.revealRange(input.options.selection)
            editor.setPosition({ column: input.options.selection.startColumn, lineNumber: input.options.selection.startLineNumber })
          }
        } catch (e) {
          console.log(e)
        }
      }
      return result
    }
    // just for e2e testing
    const loadedElement = document.createElement('span')
    loadedElement.setAttribute('data-id', 'editorloaded')
    document.body.appendChild(loadedElement)
  }

  function handleEditorWillMount(monaco) {
    console.log('handleEditorWillMount', monaco)
    monacoRef.current = monaco
    // Register a new language
    monacoRef.current.languages.register({ id: 'remix-solidity' })
    monacoRef.current.languages.register({ id: 'remix-cairo' })
    monacoRef.current.languages.register({ id: 'remix-zokrates' })
    monacoRef.current.languages.register({ id: 'remix-move' })

    // Register a tokens provider for the language
    monacoRef.current.languages.setMonarchTokensProvider('remix-solidity', solidityTokensProvider as any)
    monacoRef.current.languages.setLanguageConfiguration('remix-solidity', solidityLanguageConfig as any )

    monacoRef.current.languages.setMonarchTokensProvider('remix-cairo', cairoTokensProvider as any)
    monacoRef.current.languages.setLanguageConfiguration('remix-cairo', cairoLanguageConfig as any)

    monacoRef.current.languages.setMonarchTokensProvider('remix-zokrates', zokratesTokensProvider as any)
    monacoRef.current.languages.setLanguageConfiguration('remix-zokrates', zokratesLanguageConfig as any)

    monacoRef.current.languages.setMonarchTokensProvider('remix-move', moveTokenProvider as any)
    monacoRef.current.languages.setLanguageConfiguration('remix-move', moveLanguageConfig as any)

    monacoRef.current.languages.registerDefinitionProvider('remix-solidity', new RemixDefinitionProvider(props, monaco))
    monacoRef.current.languages.registerDocumentHighlightProvider('remix-solidity', new RemixHighLightProvider(props, monaco))
    monacoRef.current.languages.registerReferenceProvider('remix-solidity', new RemixReferenceProvider(props, monaco))
    monacoRef.current.languages.registerHoverProvider('remix-solidity', new RemixHoverProvider(props, monaco))
    monacoRef.current.languages.registerCompletionItemProvider('remix-solidity', new RemixCompletionProvider(props, monaco))

    loadTypes(monacoRef.current)
  }



  return (
    <div className="w-100 h-100 d-flex flex-column-reverse">


<DiffEditor
        originalLanguage={'remix-solidity'}
        modifiedLanguage={'remix-solidity'}
        original={''}
        modified={''}
        onMount={handleDiffEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{ readOnly: false, renderSideBySide: true }}
        width='100%'
        height='100%'
      />



      {editorModelsState[props.currentFile]?.readOnly && <span className='pl-4 h6 mb-0 w-100 alert-info position-absolute bottom-0 end-0'>
        <i className="fas fa-lock-alt p-2"></i>
          The file is opened in <b>read-only</b> mode.
        </span>
      }
    </div>
  )
}

export default EditorUI

/*

<Editor
        width="100%"
        path={props.currentFile}
        language={editorModelsState[props.currentFile] ? editorModelsState[props.currentFile].language : 'text'}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{ glyphMargin: true, readOnly: ((!editorRef.current || !props.currentFile) && editorModelsState[props.currentFile]?.readOnly) }}
        defaultValue={defaultEditorValue}
      />

      */