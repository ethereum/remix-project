export interface Action {
  type: string;
  payload: Record<string, any>
  monaco: any
}

export const initialState = {}

export const reducerActions = (models = initialState, action: Action) => {
  const monaco = action.monaco
  switch (action.type) {
    case 'ADD_MODEL': {
      if (!monaco) return models
      const uri = action.payload.uri
      const value = action.payload.value
      const language = action.payload.language
      const readOnly = action.payload.readOnly
      if (models[uri]) return models // already existing
      const model = monaco.editor.createModel(value, language, monaco.Uri.parse(uri))
      model.onDidChangeContent(() => action.payload.events.onDidChangeContent(uri))
      models[uri] = { language, uri, readOnly, model }
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
      if (!monaco.editor) return models
      const uri = action.payload.uri
      const value = action.payload.value
      const model = models[uri]?.model
      if (model) {
        model.setValue(value)
      }
      return models
    }
    case 'REVEAL_LINE': {
      if (!monaco.editor) return models
      const line = action.payload.line
      const column = action.payload.column
      monaco.editor.revealLine(line)
      monaco.editor.setPosition({ column, lineNumber: line })
      return models
    }
    case 'FOCUS': {
      if (!monaco.editor) return models
      monaco.editor.focus()
      return models
    }
    case 'SET_FONTSIZE': {
      if (!monaco.editor) return models
      const size = action.payload.size
      monaco.editor.updateOptions({ fontSize: size })
      return models
    }
    case 'SET_WORDWRAP': {
      if (!monaco.editor) return models
      const wrap = action.payload.wrap
      monaco.editor.updateOptions({ wordWrap: wrap ? 'on' : 'off' })
      return models
    }
  }
}

export const reducerListener = (plugin, dispatch, monaco, events) => {
  plugin.on('editor', 'addModel', (value, language, uri, readOnly) => {
    dispatch({
      type: 'ADD_MODEL',
      payload: { uri, value, language, readOnly, events },
      monaco
    })
  })

  plugin.on('editor', 'disposeModel', (uri) => {
    dispatch({
      type: 'DISPOSE_MODEL',
      payload: { uri },
      monaco
    })
  })

  plugin.on('editor', 'setValue', (uri, value) => {
    dispatch({
      type: 'SET_VALUE',
      payload: { uri, value },
      monaco
    })
  })

  plugin.on('editor', 'revealLine', (line, column) => {
    dispatch({
      type: 'REVEAL_LINE',
      payload: { line, column },
      monaco
    })
  })

  plugin.on('editor', 'focus', () => {
    dispatch({
      type: 'FOCUS',
      payload: {},
      monaco
    })
  })

  plugin.on('editor', 'setFontSize', (size) => {
    dispatch({
      type: 'SET_FONTSIZE',
      payload: { size },
      monaco
    })
  })

  plugin.on('editor', 'setWordWrap', (wrap) => {
    dispatch({
      type: 'SET_WORDWRAP',
      payload: { wrap },
      monaco
    })
  })
}
