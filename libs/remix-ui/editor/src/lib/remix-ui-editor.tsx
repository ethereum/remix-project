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
import { defaultEditorValue, EditorUIProps, errorMarker, sourceAnnotation, sourceMarker } from './types'



loader.config({ paths: { vs: 'assets/js/monaco-editor/dev/vs' } })



/* eslint-disable-next-line */

export const EditorUI = (props: EditorUIProps) => {
  const [, setCurrentBreakpoints] = useState({})

  const pasteCodeRef = useRef(false)
  props.editorAPI.editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null)
  props.editorAPI.diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor>(null)
  props.editorAPI.monacoRef = useRef<Monaco>(null)
  const currentFileRef = useRef('')
  const currentUrlRef = useRef('')
  // const currentDecorations = useRef({ sourceAnnotationsPerFile: {}, markerPerFile: {} }) // decorations that are currently in use by the editor
  // const registeredDecorations = useRef({}) // registered decorations

  const [editorModelsState, dispatch] = useReducer(reducerActions, initialState)

  useEffect(() => {
    if (!props.editorAPI.monacoRef.current) return
    defineAndSetTheme(props.editorAPI.monacoRef, props.themeType)
  })

  useEffect(() => {
    if (!( props.editorAPI.editorRef.current ||  props.editorAPI.diffEditorRef.current)  || !props.currentFile) return
    currentFileRef.current = props.currentFile
    props.plugin.call('fileManager', 'getUrlFromPath', currentFileRef.current).then((url) => currentUrlRef.current = url.file)

    const file = editorModelsState[props.currentFile]
    console.log('file', file)
    props.editorAPI.editorRef &&  props.editorAPI.editorRef.current &&  props.editorAPI.editorRef.current.setModel(file.model)
    props.editorAPI.diffEditorRef &&  props.editorAPI.diffEditorRef.current &&  props.editorAPI.diffEditorRef.current.setModel({
      original: file.model,
      modified: file.model
    })
    getEditor().updateOptions({ readOnly: editorModelsState[props.currentFile].readOnly })
    
    if (file.language === 'sol') {
      props.editorAPI.monacoRef.current.editor.setModelLanguage(file.model, 'remix-solidity')
    } else if (file.language === 'cairo') {
      props.editorAPI.monacoRef.current.editor.setModelLanguage(file.model, 'remix-cairo')
    } else if (file.language === 'zokrates') {
      props.editorAPI.monacoRef.current.editor.setModelLanguage(file.model, 'remix-zokrates')
    } else if (file.language === 'move') {
      props.editorAPI.monacoRef.current.editor.setModelLanguage(file.model, 'remix-move')
    }
  }, [props.currentFile])

  const getEditor = () => {
    if(props.editorAPI.editorRef.current) return  props.editorAPI.editorRef.current
    if(props.editorAPI.diffEditorRef.current) return  props.editorAPI.diffEditorRef.current.getModifiedEditor()
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
          decorations.push(convertToMonacoDecoration(decoration.value, typeOfDecoration, props.editorAPI.monacoRef))
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
          decorations.push(convertToMonacoDecoration(decoration.value, typeOfDecoration, props.editorAPI.monacoRef))
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
    const monacoDecoration = convertToMonacoDecoration(decoration, typeOfDecoration, props.editorAPI.monacoRef)
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
        props.editorAPI.monacoRef.current.editor.setModelMarkers(model, from, allMarkersPerfile[filePath])
      }
    }
  }

  props.editorAPI.clearErrorMarkers = async (sources: string[] | {[fileName: string]: any}, from: string) => {
    if (sources) {
      for (const source of (Array.isArray(sources) ? sources : Object.keys(sources))) {
        const filePath = source
        const model = editorModelsState[filePath]?.model
        if (model) {
          props.editorAPI.monacoRef.current.editor.setModelMarkers(model, from, [])
        }
      }
    }
  }

  props.editorAPI.findMatches = (uri: string, value: string) => {
    if (! props.editorAPI.editorRef.current) return
    const model = editorModelsState[uri]?.model
    if (model) return model.findMatches(value)
  }

  props.editorAPI.getValue = (uri: string) => {
    if (! props.editorAPI.editorRef.current) return
    const model = editorModelsState[uri]?.model
    if (model) {
      return model.getValue()
    }
  }

  props.editorAPI.getCursorPosition = (offset:boolean = true) => {
    console.log(this)
    if (!props.editorAPI.monacoRef.current) return
    const model = editorModelsState[currentFileRef.current]?.model
    if (model) {
      return offset? model.getOffsetAt(getEditor().getPosition()): getEditor().getPosition()
    }
  }

  props.editorAPI.getHoverPosition = (position: monaco.Position) => {
    if (!props.editorAPI.monacoRef.current) return
    const model = editorModelsState[currentFileRef.current]?.model
    if (model) {
      return model.getOffsetAt(position)
    } else {
      return 0
    }
  }

  props.editorAPI.getFontSize = () => {
    if (! props.editorAPI.editorRef.current) return
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
            range: new props.editorAPI.monacoRef.current.Range(position.lineNumber, 1, position.lineNumber, 1),
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
    props.editorAPI.diffEditorRef.current= editor
    defineAndSetTheme(props.editorAPI.monacoRef, props.themeType)
    reducerListener(props.plugin, dispatch, props.editorAPI.monacoRef.current,  props.editorAPI.diffEditorRef.current.getModifiedEditor(), props.events)
    props.events.onEditorMounted()
  }

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    console.log('editor mounted', editor)
    props.editorAPI.editorRef.current = editor
    defineAndSetTheme(props.editorAPI.monacoRef, props.themeType)
    reducerListener(props.plugin, dispatch, props.editorAPI.monacoRef.current,  props.editorAPI.editorRef.current, props.events)
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
    editor.addCommand(props.editorAPI.monacoRef.current.KeyMod.CtrlCmd | (props.editorAPI.monacoRef.current.KeyCode as any).US_EQUAL, () => {
      editor.updateOptions({ fontSize: editor.getOption(43).fontSize + 1 })
    })
    editor.addCommand(props.editorAPI.monacoRef.current.KeyMod.CtrlCmd | (props.editorAPI.monacoRef.current.KeyCode as any).US_MINUS, () => {
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
        props.editorAPI.monacoRef.current.KeyMod.CtrlCmd | props.editorAPI.monacoRef.current.KeyCode.Equal,
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
        props.editorAPI.monacoRef.current.KeyMod.CtrlCmd | props.editorAPI.monacoRef.current.KeyCode.Minus,
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
        props.editorAPI.monacoRef.current.KeyMod.Shift | props.editorAPI.monacoRef.current.KeyMod.Alt | props.editorAPI.monacoRef.current.KeyCode.KeyF,
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
    props.editorAPI.monacoRef.current = monaco
    // Register a new language
    props.editorAPI.monacoRef.current.languages.register({ id: 'remix-solidity' })
    props.editorAPI.monacoRef.current.languages.register({ id: 'remix-cairo' })
    props.editorAPI.monacoRef.current.languages.register({ id: 'remix-zokrates' })
    props.editorAPI.monacoRef.current.languages.register({ id: 'remix-move' })

    // Register a tokens provider for the language
    props.editorAPI.monacoRef.current.languages.setMonarchTokensProvider('remix-solidity', solidityTokensProvider as any)
    props.editorAPI.monacoRef.current.languages.setLanguageConfiguration('remix-solidity', solidityLanguageConfig as any )

    props.editorAPI.monacoRef.current.languages.setMonarchTokensProvider('remix-cairo', cairoTokensProvider as any)
    props.editorAPI.monacoRef.current.languages.setLanguageConfiguration('remix-cairo', cairoLanguageConfig as any)

    props.editorAPI.monacoRef.current.languages.setMonarchTokensProvider('remix-zokrates', zokratesTokensProvider as any)
    props.editorAPI.monacoRef.current.languages.setLanguageConfiguration('remix-zokrates', zokratesLanguageConfig as any)

    props.editorAPI.monacoRef.current.languages.setMonarchTokensProvider('remix-move', moveTokenProvider as any)
    props.editorAPI.monacoRef.current.languages.setLanguageConfiguration('remix-move', moveLanguageConfig as any)

    props.editorAPI.monacoRef.current.languages.registerDefinitionProvider('remix-solidity', new RemixDefinitionProvider(props, monaco))
    props.editorAPI.monacoRef.current.languages.registerDocumentHighlightProvider('remix-solidity', new RemixHighLightProvider(props, monaco))
    props.editorAPI.monacoRef.current.languages.registerReferenceProvider('remix-solidity', new RemixReferenceProvider(props, monaco))
    props.editorAPI.monacoRef.current.languages.registerHoverProvider('remix-solidity', new RemixHoverProvider(props, monaco))
    props.editorAPI.monacoRef.current.languages.registerCompletionItemProvider('remix-solidity', new RemixCompletionProvider(props, monaco))

    loadTypes(props.editorAPI.monacoRef.current)
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

<Editor
        width="100%"
        path={props.currentFile}
        language={editorModelsState[props.currentFile] ? editorModelsState[props.currentFile].language : 'text'}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{ glyphMargin: true, readOnly: ((! props.editorAPI.editorRef.current || !props.currentFile) && editorModelsState[props.currentFile]?.readOnly) }}
        defaultValue={defaultEditorValue}
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



      */