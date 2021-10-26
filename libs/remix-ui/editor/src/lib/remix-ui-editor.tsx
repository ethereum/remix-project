import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import Editor from '@monaco-editor/react'
import { reducerActions, reducerListener, initialState } from './actions/editor'

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
  theme: string
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
  editorAPI:{
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

  useEffect(() => {
    if (!monacoRef.current) return
    monacoRef.current.editor.setTheme(props.theme)
  }, [props.theme])

  if (monacoRef.current) monacoRef.current.editor.setTheme(props.theme)

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
    editorRef.current.setModel(editorModelsState[props.currentFile].model)
    editorRef.current.updateOptions({ readOnly: editorModelsState[props.currentFile].readOnly })
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
    monacoRef.current.editor.setTheme(props.theme)
    reducerListener(props.plugin, dispatch, monacoRef.current, editorRef.current, props.events)
    props.events.onEditorMounted()
    editor.onMouseUp((e) => {
      if (e && e.target && e.target.toString().startsWith('GUTTER')) {
        (window as any).addRemixBreakpoint(e.target.position)
      }
    })
  }

  function handleEditorWillMount (monaco) {
    monacoRef.current = monaco
    // see https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors
    const lightColor = window.getComputedStyle(document.documentElement).getPropertyValue('--light').trim()
    const infoColor = window.getComputedStyle(document.documentElement).getPropertyValue('--info').trim()
    const darkColor = window.getComputedStyle(document.documentElement).getPropertyValue('--dark').trim()
    const grayColor = window.getComputedStyle(document.documentElement).getPropertyValue('--gray-dark').trim()
    monaco.editor.defineTheme('remix-dark', {
      base: 'vs-dark',
      inherit: true, // can also be false to completely replace the builtin rules
      rules: [{ background: darkColor.replace('#', '') }],
      colors: {
        'editor.background': darkColor,
        'editorSuggestWidget.background': lightColor,
        'editorSuggestWidget.selectedBackground': lightColor,
        'editorSuggestWidget.highlightForeground': infoColor,
        'editor.lineHighlightBorder': lightColor,
        'editor.lineHighlightBackground': grayColor,
        'editorGutter.background': lightColor
      }
    })
  }

  return (
    <Editor
      width="100%"
      height="100%"
      path={props.currentFile}
      language={editorModelsState[props.currentFile] ? editorModelsState[props.currentFile].language : 'text'}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
      options= { { glyphMargin: true } }
    />
  )
}

export default EditorUI
