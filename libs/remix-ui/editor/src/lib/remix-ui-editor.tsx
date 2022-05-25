import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { RemixUiEditorContextView, astNode } from '@remix-ui/editor-context-view'
import Editor, { loader } from '@monaco-editor/react'
import { reducerActions, reducerListener, initialState } from './actions/editor'
import { language, conf } from './syntax'
import { cairoLang, cairoConf } from './cairoSyntax'

import './remix-ui-editor.css'
import { loadTypes } from './web-types'

type cursorPosition = {
  startLineNumber: number,
  startColumn: number,
  endLineNumber: number,
  endColumn: number
}

type sourceAnnotation = {
  row: number,
  column: number,
  text: string,
  type: 'error' | 'warning' | 'info'
  hide: boolean
  from: string // plugin name
}

type sourceMarker = {
  position: {
    start: {
      line: number
      column: number
    },
    end: {
      line: number
      column: number
    }
  },
  from: string // plugin name
  hide: boolean
}

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
  }
  plugin: {
    on: (plugin: string, event: string, listener: any) => void
    call: (plugin: string, method: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any) => any
  }
  editorAPI: {
    findMatches: (uri: string, value: string) => any
    getFontSize: () => number,
    getValue: (uri: string) => string
    getCursorPosition: () => cursorPosition
    addDecoration: (marker: sourceMarker, filePath: string, typeOfDecoration: string) => DecorationsReturn
    clearDecorationsByPlugin: (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => DecorationsReturn
    keepDecorationsFor: (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => DecorationsReturn
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
  \t\t\t\t\t\t\t\tCtrl + Shift + F : Open the File Explorer\n
  \t\t\t\t\t\t\t\tCtrl + Shift + A : Open the Plugin Manager\n
  \t\t\t\t\t\t\t\tCTRL + SHIFT + S: Compile the current contract & Run an associated script\n\n
  \t\t\t\t\t\t\tImportant Links:\n
  \t\t\t\t\t\t\t\tOfficial website about the Remix Project: https://remix-project.org/\n
  \t\t\t\t\t\t\t\tOfficial documentation: https://remix-ide.readthedocs.io/en/latest/\n
  \t\t\t\t\t\t\t\tGithub: https://github.com/ethereum/remix-project\n
  \t\t\t\t\t\t\t\tGitter: https://gitter.im/ethereum/remix\n
  \t\t\t\t\t\t\t\tMedium: https://medium.com/remix-ide\n
  \t\t\t\t\t\t\t\tTwitter: https://twitter.com/ethereumremix\n
  `
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const currentFileRef = useRef('')
  // const currentDecorations = useRef({ sourceAnnotationsPerFile: {}, markerPerFile: {} }) // decorations that are currently in use by the editor
  // const registeredDecorations = useRef({}) // registered decorations
  
  const [editorModelsState, dispatch] = useReducer(reducerActions, initialState)

  const formatColor = (name) => {
    let color = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    if (color.length === 4) {
      color = color.concat(color.substr(1))
    }
    return color
  }
  const defineAndSetTheme = (monaco) => {
    const themeType = props.themeType === 'dark' ? 'vs-dark' : 'vs'
    const themeName = props.themeType === 'dark' ? 'remix-dark' : 'remix-light'
    // see https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors
    const lightColor = formatColor('--light')
    const infoColor = formatColor('--info')
    const darkColor = formatColor('--dark')
    const secondaryColor = formatColor('--secondary')
    const textColor = formatColor('--text') || darkColor
    const textbackground = formatColor('--text-background') || lightColor

    const blueColor = formatColor('--blue')
    const successColor = formatColor('--success')
    const warningColor = formatColor('--warning')
    const yellowColor = formatColor('--yellow')
    const pinkColor = formatColor('--pink')
    const locationColor = '#9e7e08'
    // const purpleColor = formatColor('--purple')
    const dangerColor = formatColor('--danger')
    const greenColor = formatColor('--green')
    const orangeColor = formatColor('--orange')
    const grayColor = formatColor('--gray')

    monaco.editor.defineTheme(themeName, {
      base: themeType,
      inherit: true, // can also be false to completely replace the builtin rules
      rules: [
        { background: darkColor.replace('#', '') },
        { foreground: textColor.replace('#', '') },

        // global variables
        { token: 'keyword.abi', foreground: blueColor },
        { token: 'keyword.block', foreground: blueColor },
        { token: 'keyword.bytes', foreground: blueColor },
        { token: 'keyword.msg', foreground: blueColor },
        { token: 'keyword.tx', foreground: blueColor },

        // global functions
        { token: 'keyword.assert', foreground: blueColor },
        { token: 'keyword.require', foreground: blueColor },
        { token: 'keyword.revert', foreground: blueColor },
        { token: 'keyword.blockhash', foreground: blueColor },
        { token: 'keyword.keccak256', foreground: blueColor },
        { token: 'keyword.sha256', foreground: blueColor },
        { token: 'keyword.ripemd160', foreground: blueColor },
        { token: 'keyword.ecrecover', foreground: blueColor },
        { token: 'keyword.addmod', foreground: blueColor },
        { token: 'keyword.mulmod', foreground: blueColor },
        { token: 'keyword.selfdestruct', foreground: blueColor },
        { token: 'keyword.type ', foreground: blueColor },
        { token: 'keyword.gasleft', foreground: blueColor },

        // specials
        { token: 'keyword.super', foreground: infoColor },
        { token: 'keyword.this', foreground: infoColor },
        { token: 'keyword.virtual', foreground: infoColor },

        // for state variables
        { token: 'keyword.constants', foreground: grayColor },
        { token: 'keyword.override', foreground: grayColor },
        { token: 'keyword.immutable', foreground: grayColor },

        // data location
        { token: 'keyword.memory', foreground: locationColor },
        { token: 'keyword.storage', foreground: locationColor },
        { token: 'keyword.calldata', foreground: locationColor },

        // for Events
        { token: 'keyword.indexed', foreground: yellowColor },
        { token: 'keyword.anonymous', foreground: yellowColor },

        // for functions
        { token: 'keyword.external', foreground: successColor },
        { token: 'keyword.internal', foreground: successColor },
        { token: 'keyword.private', foreground: successColor },
        { token: 'keyword.public', foreground: successColor },
        { token: 'keyword.view', foreground: successColor },
        { token: 'keyword.pure', foreground: successColor },
        { token: 'keyword.payable', foreground: successColor },
        { token: 'keyword.nonpayable', foreground: successColor },

        // Errors
        { token: 'keyword.Error', foreground: dangerColor },
        { token: 'keyword.Panic', foreground: dangerColor },

        // special functions
        { token: 'keyword.fallback', foreground: pinkColor },
        { token: 'keyword.receive', foreground: pinkColor },
        { token: 'keyword.constructor', foreground: pinkColor },

        // identifiers
        { token: 'keyword.identifier', foreground: warningColor },
        { token: 'keyword.for', foreground: warningColor },
        { token: 'keyword.break', foreground: warningColor },
        { token: 'keyword.continue', foreground: warningColor },
        { token: 'keyword.while', foreground: warningColor },
        { token: 'keyword.do', foreground: warningColor },

        { token: 'keyword.if', foreground: yellowColor },
        { token: 'keyword.else', foreground: yellowColor },

        { token: 'keyword.throw', foreground: orangeColor },
        { token: 'keyword.catch', foreground: orangeColor },
        { token: 'keyword.try', foreground: orangeColor },

        // returns
        { token: 'keyword.returns', foreground: greenColor },
        { token: 'keyword.return', foreground: greenColor }

      ],
      colors: {
        // see https://code.visualstudio.com/api/references/theme-color for more settings
        'editor.background': textbackground,
        'editorSuggestWidget.background': lightColor,
        'editorSuggestWidget.selectedBackground': lightColor,
        'editorSuggestWidget.highlightForeground': infoColor,
        'editor.lineHighlightBorder': secondaryColor,
        'editor.lineHighlightBackground': textbackground === darkColor ? lightColor : secondaryColor,
        'editorGutter.background': lightColor,
        //'editor.selectionHighlightBackground': secondaryColor,
        'minimap.background': lightColor,
        'menu.foreground': textColor,
        'menu.background': textbackground,
        'menu.selectionBackground': secondaryColor,
        'menu.selectionForeground': textColor,
        'menu.selectionBorder': secondaryColor
      }
    })
    monacoRef.current.editor.setTheme(themeName)
  }

  useEffect(() => {
    if (!monacoRef.current) return
    defineAndSetTheme(monacoRef.current)
  })


  useEffect(() => {
    if (!editorRef.current || !props.currentFile) return
    currentFileRef.current = props.currentFile
    const file = editorModelsState[props.currentFile]
    editorRef.current.setModel(file.model)
    editorRef.current.updateOptions({ readOnly: editorModelsState[props.currentFile].readOnly })
    if (file.language === 'sol') {
      monacoRef.current.editor.setModelLanguage(file.model, 'remix-solidity')
    } else if (file.language === 'cairo') {
      monacoRef.current.editor.setModelLanguage(file.model, 'remix-cairo')
    }    
  }, [props.currentFile])

  const convertToMonacoDecoration = (decoration: sourceAnnotation | sourceMarker, typeOfDecoration: string) => {
    if (typeOfDecoration === 'sourceAnnotationsPerFile') {
      decoration = decoration as sourceAnnotation
      return {
        type: typeOfDecoration,
        range: new monacoRef.current.Range(decoration.row + 1, 1, decoration.row + 1, 1),
        options: {
          isWholeLine: false,
          glyphMarginHoverMessage: { value: (decoration.from ? `from ${decoration.from}:\n` : '') + decoration.text },
          glyphMarginClassName: `fal fa-exclamation-square text-${decoration.type === 'error' ? 'danger' : (decoration.type === 'warning' ? 'warning' : 'info')}`
        }
      }
    }
    if (typeOfDecoration === 'markerPerFile') {
      decoration = decoration as sourceMarker
      let isWholeLine = false
      if ((decoration.position.start.line === decoration.position.end.line && decoration.position.end.column - decoration.position.start.column < 2) ||
        (decoration.position.start.line !== decoration.position.end.line)) {
        // in this case we force highlighting the whole line (doesn't make sense to highlight 2 chars)
        isWholeLine = true
      }
      return {
        type: typeOfDecoration,
        range: new monacoRef.current.Range(decoration.position.start.line + 1, decoration.position.start.column + 1, decoration.position.end.line + 1, decoration.position.end.column + 1),
        options: {
          isWholeLine,
          inlineClassName: `${isWholeLine ? 'alert-info' : 'inline-class'}  border-0 highlightLine${decoration.position.start.line + 1}`
        }
      }
    }
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
          decorations.push(convertToMonacoDecoration(decoration.value, typeOfDecoration))
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
          decorations.push(convertToMonacoDecoration(decoration.value, typeOfDecoration))
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
    const monacoDecoration = convertToMonacoDecoration(decoration, typeOfDecoration)

    return {
      currentDecorations: model.deltaDecorations([], [monacoDecoration]),
      registeredDecorations: [{ value: decoration, type: typeOfDecoration }]
    }
  }
  
  props.editorAPI.addDecoration = (marker: sourceMarker, filePath: string, typeOfDecoration: string) => {
    return addDecoration(marker, filePath, typeOfDecoration)
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

  props.editorAPI.getCursorPosition = () => {
    if (!monacoRef.current) return
    const model = editorModelsState[currentFileRef.current]?.model
    if (model) {
      return model.getOffsetAt(editorRef.current.getPosition())
    }
  }

  props.editorAPI.getFontSize = () => {
    if (!editorRef.current) return
    return editorRef.current.getOption(43).fontSize
  }

  (window as any).addRemixBreakpoint = (position) => { // make it available from e2e testing...
    const model = editorRef.current.getModel()
    if (model) {
      setCurrentBreakpoints(prevState => {
        const currentFile = currentFileRef.current
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

  function handleEditorDidMount (editor) {
    editorRef.current = editor
    defineAndSetTheme(monacoRef.current)
    reducerListener(props.plugin, dispatch, monacoRef.current, editorRef.current, props.events)
    props.events.onEditorMounted()
    editor.onMouseUp((e) => {
      if (e && e.target && e.target.toString().startsWith('GUTTER')) {
        (window as any).addRemixBreakpoint(e.target.position)
      }
    })
    editor.addCommand(monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.US_EQUAL, () => {
      editor.updateOptions({ fontSize: editor.getOption(43).fontSize + 1 })
    })
    editor.addCommand(monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.US_MINUS, () => {
      editor.updateOptions({ fontSize: editor.getOption(43).fontSize - 1 })
    })
  }

  function handleEditorWillMount (monaco) {
    monacoRef.current = monaco
    // Register a new language
    monacoRef.current.languages.register({ id: 'remix-solidity' })
    monacoRef.current.languages.register({ id: 'remix-cairo' })
    // Register a tokens provider for the language
    monacoRef.current.languages.setMonarchTokensProvider('remix-solidity', language)
    monacoRef.current.languages.setLanguageConfiguration('remix-solidity', conf)

    monacoRef.current.languages.setMonarchTokensProvider('remix-cairo', cairoLang)
    monacoRef.current.languages.setLanguageConfiguration('remix-cairo', cairoConf)

    loadTypes(monacoRef.current)
  }

  return (
    <div className="w-100 h-100 d-flex flex-column-reverse">
      <Editor
        width="100%"
        path={props.currentFile}
        language={editorModelsState[props.currentFile] ? editorModelsState[props.currentFile].language : 'text'}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{ glyphMargin: true, readOnly: true}}
        defaultValue={defaultEditorValue}
      />
      <div className="contextview">
        <RemixUiEditorContextView
          hide={false}
          gotoLine={(line, column) => props.plugin.call('editor', 'gotoLine', line, column)}
          openFile={(file) => props.plugin.call('fileManager', 'switchFile', file)}
          getLastCompilationResult={() => { return props.plugin.call('compilerArtefacts', 'getLastCompilationResult') } }
          offsetToLineColumn={(position, file, sources, asts) => { return props.plugin.call('offsetToLineColumnConverter', 'offsetToLineColumn', position, file, sources, asts) } }
          getCurrentFileName={() => { return props.plugin.call('fileManager', 'file') } }
          onContextListenerChanged={(listener) => { props.plugin.on('contextualListener', 'contextChanged', listener) }}
          onCurrentFileChanged={(listener) => { props.plugin.on('fileManager', 'currentFileChanged', listener) }}
          referencesOf={(node: astNode) => { return props.plugin.call('contextualListener', 'referencesOf', node) }}
          getActiveHighlights={() => { return props.plugin.call('contextualListener', 'getActiveHighlights') }}
          gasEstimation={(node: astNode) => { return props.plugin.call('contextualListener', 'gasEstimation', node) }}
          declarationOf={(node: astNode) => { return props.plugin.call('contextualListener', 'declarationOf', node) }}
        />
      </div>
    </div>
  )
}

export default EditorUI
