import { IRange } from "monaco-editor";

export interface Action {
  type: string;
  payload: Record<string, any>
  monaco: any,
  editor: any
}

export const initialState = {}

export const reducerActions = (models = initialState, action: Action) => {
  const monaco = action.monaco
  const editor = action.editor
  switch (action.type) {
    case 'ADD_MODEL': {
      if (!editor) return models
      const uri = action.payload.uri
      const value = action.payload.value
      const language = action.payload.language
      const readOnly = action.payload.readOnly
      if (models[uri]) return models // already existing
      models[uri] = { language, uri, readOnly }
      const model = monaco.editor.createModel(value, language, monaco.Uri.parse(uri))
      models[uri].model = model
      model.onDidChangeContent(() => action.payload.events.onDidChangeContent(uri))
      return models
    }
    case 'DISPOSE_MODEL': {
      const uri = action.payload.uri
      const model = models[uri]?.model
      if (model) model.dispose()
      delete models[uri]
      return models
    }
    case 'SET_VALUE': {
      if (!editor) return models
      const uri = action.payload.uri
      const value = action.payload.value
      const model = models[uri]?.model
      if (model) {
        model.setValue(value)
      }
      return models
    }
    case 'REVEAL_LINE': {
      if (!editor) return models
      const line = action.payload.line
      const column = action.payload.column
      editor.revealLine(line)
      editor.setPosition({ column, lineNumber: line })
      return models
    }
    case 'REVEAL_RANGE': {
      if (!editor) return models
      const range: IRange = {
        startLineNumber: action.payload.startLineNumber +1,
        startColumn: action.payload.startColumn,
        endLineNumber: action.payload.endLineNumber + 1,
        endColumn: action.payload.endColumn
      }
      // reset to start of line
      if(action.payload.startColumn < 100){
        editor.revealRange({
          startLineNumber: range.startLineNumber,
          startColumn: 1,
          endLineNumber: range.endLineNumber,
          endColumn: 1
        })
      }else{
        editor.revealRangeInCenter(range)
      }
      return models
    }
    case 'FOCUS': {
      if (!editor) return models
      editor.focus()
      return models
    }
    case 'SET_FONTSIZE': {
      if (!editor) return models
      const size = action.payload.size
      editor.updateOptions({ fontSize: size })
      return models
    }
    case 'SET_WORDWRAP': {
      if (!editor) return models
      const wrap = action.payload.wrap
      editor.updateOptions({ wordWrap: wrap ? 'on' : 'off' })
      return models
    }
  }
}

export const reducerListener = (plugin, dispatch, monaco, editor, events) => {
  plugin.on('editor', 'addModel', (value, language, uri, readOnly) => {
    dispatch({
      type: 'ADD_MODEL',
      payload: { uri, value, language, readOnly, events },
      monaco,
      editor
    })
  })

  plugin.on('editor', 'disposeModel', (uri) => {
    dispatch({
      type: 'DISPOSE_MODEL',
      payload: { uri },
      monaco,
      editor
    })
  })

  plugin.on('editor', 'setValue', (uri, value) => {
    dispatch({
      type: 'SET_VALUE',
      payload: { uri, value },
      monaco,
      editor
    })
  })

  plugin.on('editor', 'revealLine', (line, column) => {
    dispatch({
      type: 'REVEAL_LINE',
      payload: { line, column },
      monaco,
      editor
    })
  })

  plugin.on('editor', 'revealRange', (startLineNumber, startColumn, endLineNumber, endColumn) => {
    dispatch({
      type: 'REVEAL_RANGE',
      payload: { 
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
       },
      monaco,
      editor
    })
  })

  plugin.on('editor', 'focus', () => {
    dispatch({
      type: 'FOCUS',
      payload: {},
      monaco,
      editor
    })
  })

  plugin.on('editor', 'setFontSize', (size) => {
    dispatch({
      type: 'SET_FONTSIZE',
      payload: { size },
      monaco,
      editor
    })
  })

  plugin.on('editor', 'setWordWrap', (wrap) => {
    dispatch({
      type: 'SET_WORDWRAP',
      payload: { wrap },
      monaco,
      editor
    })
  })
}
