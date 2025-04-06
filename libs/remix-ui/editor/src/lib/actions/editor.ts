
import { monacoTypes } from '@remix-ui/editor';
import { commitChange } from '@remix-ui/git';
import monaco from '../../types/monaco';
export type EditorAction =
  | {
      type: 'ADD_MODEL';
      payload: {
        uri: string;
        value: string;
        language: string;
        readOnly?: boolean;
        events: any;
      };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'DISPOSE_MODEL';
      payload: { uri: string };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'SET_VALUE';
      payload: { uri: string; value: string };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'SET_FOCUSED_GROUP';
      payload: { groupId: string };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'ADD_TAB';
      payload: { uri: string; label: string; groupId: string };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'REMOVE_TAB';
      payload: { uri: string };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'REVEAL_LINE';
      payload: { line: number; column: number };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'REVEAL_RANGE';
      payload: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
      };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'FOCUS';
      payload: {};
      monaco: any;
      editors: any[];
    }
  | {
      type: 'ADD_DIFF';
      payload: { value: any };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'SET_FONTSIZE';
      payload: { size: number };
      monaco: any;
      editors: any[];
    }
  | {
      type: 'SET_WORDWRAP';
      payload: { wrap: boolean };
      monaco: any;
      editors: any[];
    };

export interface EditorModelsState {
  models: {
    [uri: string]: {
      model: monaco.editor.ITextModel;
      uri: string;
      language: string;
      readOnly?: boolean;
    };
  };
  tabs: {
    [uri: string]: {
      label: string;
      uri: string;
      groupId: string;
    };
  };
  focusedGroupId: string | null;
}

export const initialState: EditorModelsState = {
  models: {},
  tabs: {},
  focusedGroupId: null,
};

export const reducerActions = (state: EditorModelsState = initialState, action: EditorAction): EditorModelsState => {
  const monaco = action.monaco
  const editors = action.editors as any[]
  switch (action.type) {
    case 'ADD_MODEL': {
      const { uri, value, language, readOnly, events } = action.payload

      if (state.models[uri]) return state // already exists

      let model: monaco.editor.ITextModel | undefined = undefined
      try {
        model = monaco.editor.createModel(value, language, monaco.Uri.parse(uri))
      } catch (e) {
        console.error('Failed to create model', e)
      }

      if (model) {
        model.onDidChangeContent(() => events.onDidChangeContent(uri))
      }

      return {
        ...state,
        models: {
          ...state.models,
          [uri]: {
            model,
            uri,
            language,
            readOnly
          }
        }
      }
    }

    case 'SET_VALUE': {
      const { uri, value } = action.payload
      const model = state.models[uri]?.model
      if (model) model.setValue(value)
      return state
    }

    case 'DISPOSE_MODEL': {
      const { uri } = action.payload
      const model = state.models[uri]?.model
      if (model) model.dispose()

      const { [uri]: _, ...rest } = state.models

      return {
        ...state,
        models: rest
      }
    }

    case 'SET_FOCUSED_GROUP': {
      return {
        ...state,
        focusedGroupId: action.payload.groupId
      }
    }

    case 'ADD_TAB': {
      const { uri, label, groupId } = action.payload
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [uri]: { uri, label, groupId }
        }
      }
    }

    case 'REMOVE_TAB': {
      const { uri } = action.payload
      const { [uri]: _, ...rest } = state.tabs
      return {
        ...state,
        tabs: rest
      }
    }
    case 'ADD_DIFF': {
      // You can flesh this out later; just return state for now
      return state
    }

    case 'REVEAL_LINE': {
      const { line, column } = action.payload
      editors.forEach(editor => {
        editor.revealLine(line)
        editor.setPosition({ column, lineNumber: line })
      })
      return state
    }

    case 'REVEAL_RANGE': {
      const range: monacoTypes.IRange = {
        startLineNumber: action.payload.startLineNumber + 1,
        startColumn: action.payload.startColumn,
        endLineNumber: action.payload.endLineNumber + 1,
        endColumn: action.payload.endColumn
      }

      editors.forEach(editor => {
        if (action.payload.startColumn < 100) {
          editor.revealRange({
            startLineNumber: range.startLineNumber,
            startColumn: 1,
            endLineNumber: range.endLineNumber,
            endColumn: 1
          })
        } else {
          editor.revealRangeInCenter(range)
        }
      })

      return state
    }

    case 'FOCUS': {
      editors.forEach(editor => editor.focus())
      return state
    }

    case 'SET_FONTSIZE': {
      const size = action.payload.size
      editors.forEach(editor => {
        const action = size === 1 ? 'editor.action.fontZoomIn' : 'editor.action.fontZoomOut'
        editor.trigger('keyboard', action, {})
      })
      return state
    }

    case 'SET_WORDWRAP': {
      const wrap = action.payload.wrap
      editors.forEach(editor =>
        editor.updateOptions({ wordWrap: wrap ? 'on' : 'off' }))
      return state
    }
  }
}

export const reducerListener = (plugin, dispatch, monaco, editors: any[], events) => {
  plugin.on('editor', 'addModel', (value, language, uri, readOnly) => {
    dispatch({
      type: 'ADD_MODEL',
      payload: { uri, value, language, readOnly, events },
      monaco,
      editors
    })
  })

  plugin.on('editor', 'addDiff', (value: commitChange) => {
    dispatch({
      type: 'ADD_DIFF',
      payload: { value },
      monaco,
      editors
    })
  })

  plugin.on('editor', 'disposeModel', (uri) => {
    dispatch({
      type: 'DISPOSE_MODEL',
      payload: { uri },
      monaco,
      editors
    })
  })

  plugin.on('editor', 'setValue', (uri, value) => {
    dispatch({
      type: 'SET_VALUE',
      payload: { uri, value },
      monaco,
      editors
    })
  })

  plugin.on('editor', 'revealLine', (line, column) => {
    dispatch({
      type: 'REVEAL_LINE',
      payload: { line, column },
      monaco,
      editors
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
      editors
    })
  })

  plugin.on('editor', 'focus', () => {
    dispatch({
      type: 'FOCUS',
      payload: {},
      monaco,
      editors
    })
  })

  plugin.on('editor', 'setFontSize', (size) => {
    dispatch({
      type: 'SET_FONTSIZE',
      payload: { size },
      monaco,
      editors
    })
  })

  plugin.on('editor', 'setWordWrap', (wrap) => {
    dispatch({
      type: 'SET_WORDWRAP',
      payload: { wrap },
      monaco,
      editors
    })
  })
}
