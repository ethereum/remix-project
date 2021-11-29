import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import Editor from '@monaco-editor/react'
import { reducerActions, reducerListener, initialState } from './actions/editor'
import { language, conf } from './syntax'

import './remix-ui-editor.css'

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

type sourceAnnotationMap = {
  [key: string]: [sourceAnnotation];
}

type sourceMarkerMap = {
  [key: string]: [sourceMarker];
}

/* eslint-disable-next-line */
export interface EditorUIProps {
  activated: boolean
  themeType: string
  currentFile: string
  sourceAnnotationsPerFile: sourceAnnotationMap
  markerPerFile: sourceMarkerMap
  events: {
    onBreakPointAdded: (file: string, line: number) => void
    onBreakPointCleared: (file: string, line: number) => void
    onDidChangeContent: (file: string) => void
    onEditorMounted: () => void
  }
  plugin: {
    on: (plugin: string, event: string, listener: any) => void
  }
  editorAPI: {
    findMatches: (uri: string, value: string) => any
    getFontSize: () => number,
    getValue: (uri: string) => string
    getCursorPosition: () => cursorPosition
  }
}

export const EditorUI = (props: EditorUIProps) => {
  const [, setCurrentBreakpoints] = useState({})
  const [currentAnnotations, setCurrentAnnotations] = useState({})
  const [currentMarkers, setCurrentMarkers] = useState({})
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const currentFileRef = useRef('')

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
    const purpleColor = formatColor('--purple')
    const dangerColor = formatColor('--danger')
    const greenColor = formatColor('--green')

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

        // for state variables
        { token: 'keyword.constants', foreground: warningColor },
        { token: 'keyword.override', foreground: warningColor },
        { token: 'keyword.immutable', foreground: warningColor },

        // data location
        { token: 'keyword.memory', foreground: locationColor },
        { token: 'keyword.storage', foreground: locationColor },
        { token: 'keyword.calldata', foreground: locationColor },

        // for functions and modifiers
        { token: 'keyword.virtual', foreground: purpleColor },

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
        { token: 'keyword.identifier', foreground: purpleColor },
        { token: 'keyword.for', foreground: purpleColor },
        { token: 'keyword.if', foreground: purpleColor },
        { token: 'keyword.else', foreground: purpleColor },
        { token: 'keyword.else', foreground: purpleColor },
        { token: 'keyword.else', foreground: purpleColor },

        // returns
        { token: 'keyword.returns', foreground: greenColor }

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
        'minimap.background': lightColor
      }
    })
    monacoRef.current.editor.setTheme(themeName)
  }

  useEffect(() => {
    if (!monacoRef.current) return
    defineAndSetTheme(monacoRef.current)
  })

  const setAnnotationsbyFile = (uri) => {
    if (props.sourceAnnotationsPerFile[uri]) {
      const model = editorModelsState[uri]?.model
      const newAnnotations = []
      for (const annotation of props.sourceAnnotationsPerFile[uri]) {
        if (!annotation.hide) {
          newAnnotations.push({
            range: new monacoRef.current.Range(annotation.row + 1, 1, annotation.row + 1, 1),
            options: {
              isWholeLine: false,
              glyphMarginHoverMessage: { value: (annotation.from ? `from ${annotation.from}:\n` : '') + annotation.text },
              glyphMarginClassName: `fal fa-exclamation-square text-${annotation.type === 'error' ? 'danger' : (annotation.type === 'warning' ? 'warning' : 'info')}`
            }
          })
        }
      }
      setCurrentAnnotations(prevState => {
        prevState[uri] = model.deltaDecorations(currentAnnotations[uri] || [], newAnnotations)
        return prevState
      })
    }
  }

  const setMarkerbyFile = (uri) => {
    if (props.markerPerFile[uri]) {
      const model = editorModelsState[uri]?.model
      const newMarkers = []
      for (const marker of props.markerPerFile[uri]) {
        if (!marker.hide) {
          let isWholeLine = false
          if (marker.position.start.line === marker.position.end.line && marker.position.end.column - marker.position.start.column < 3) {
            // in this case we force highlighting the whole line (doesn't make sense to highlight 2 chars)
            isWholeLine = true
          }
          newMarkers.push({
            range: new monacoRef.current.Range(marker.position.start.line + 1, marker.position.start.column + 1, marker.position.end.line + 1, marker.position.end.column + 1),
            options: {
              isWholeLine,
              inlineClassName: `bg-info highlightLine${marker.position.start.line + 1}`
            }
          })
        }
      }
      setCurrentMarkers(prevState => {
        prevState[uri] = model.deltaDecorations(currentMarkers[uri] || [], newMarkers)
        return prevState
      })
    }
  }

  useEffect(() => {
    if (!editorRef.current) return
    currentFileRef.current = props.currentFile
    const file = editorModelsState[props.currentFile]
    editorRef.current.setModel(file.model)
    editorRef.current.updateOptions({ readOnly: editorModelsState[props.currentFile].readOnly })
    if (file.language === 'sol') monacoRef.current.editor.setModelLanguage(file.model, 'remix-solidity')
    setAnnotationsbyFile(props.currentFile)
    setMarkerbyFile(props.currentFile)
  }, [props.currentFile])

  useEffect(() => {
    setAnnotationsbyFile(props.currentFile)
  }, [JSON.stringify(props.sourceAnnotationsPerFile)])

  useEffect(() => {
    setMarkerbyFile(props.currentFile)
  }, [JSON.stringify(props.markerPerFile)])

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
    return editorRef.current.getOption(42).fontSize
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
      editor.updateOptions({ fontSize: editor.getOption(42).fontSize + 1 })
    })
    editor.addCommand(monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.US_MINUS, () => {
      editor.updateOptions({ fontSize: editor.getOption(42).fontSize - 1 })
    })
  }

  function handleEditorWillMount (monaco) {
    monacoRef.current = monaco
    // Register a new language
    monacoRef.current.languages.register({ id: 'remix-solidity' })
    // Register a tokens provider for the language
    monacoRef.current.languages.setMonarchTokensProvider('remix-solidity', language)
    monacoRef.current.languages.setLanguageConfiguration('remix-solidity', conf)
  }

  return (
    <Editor
      width="100%"
      height="100%"
      path={props.currentFile}
      language={editorModelsState[props.currentFile] ? editorModelsState[props.currentFile].language : 'text'}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
      options={{ glyphMargin: true }}
    />
  )
}

export default EditorUI
