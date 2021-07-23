export const initialState = {
  journalBlocks: {

  },
  data: {
    // lineLength: props.options.lineLength || 80,
    session: [],
    activeFilters: { commands: {}, input: '' },
    filterFns: {}
  },
  _commandHistory: [],
  _commands: {},
  commands: {},
  _JOURNAL: [],
  _jobs: [],
  _INDEX: {
  },
  _INDEXall: [],
  _INDEXallMain: [],
  _INDEXcommands: {},
  _INDEXcommandsMain: {},
  message: []
}

export const registerCommandReducer = (state, action) => {
  switch (action.type) {
    case 'html' :
      return {
        ...state,
        _commands: Object.assign(initialState._commands, action.payload._commands),
        commands: Object.assign(initialState.commands, action.payload.commands),
        data: Object.assign(initialState.data, { ...action.payload.data })
      }
    case 'log':
      return {
        ...state,
        _commands: Object.assign(initialState._commands, action.payload._commands),
        commands: Object.assign(initialState.commands, action.payload.commands),
        data: Object.assign(initialState.data, { ...action.payload.data })

      }
    case 'info':
      return {
        ...state,
        _commands: Object.assign(initialState._commands, action.payload._commands),
        commands: Object.assign(initialState.commands, action.payload.commands),
        data: Object.assign(initialState.data, action.payload.data)
      }
    case 'warn':
      return {
        ...state,
        _commands: Object.assign(initialState._commands, action.payload._commands),
        commands: Object.assign(initialState.commands, action.payload.commands),
        data: Object.assign(initialState.data, action.payload.data)
      }
    case 'error':
      return {
        ...state,
        _commands: Object.assign(initialState._commands, action.payload._commands),
        commands: Object.assign(initialState.commands, action.payload.commands),
        data: Object.assign(initialState.data, action.payload.data)
      }
    case 'script':
      return {
        ...state,
        _commands: Object.assign(initialState._commands, action.payload._commands),
        commands: Object.assign(initialState.commands, action.payload.commands),
        data: Object.assign(initialState.data, action.payload.data)
      }
    default :
      return { state }
  }
}

export const registerFilterReducer = (state, action) => {
  switch (action.type) {
    case 'log':
      console.log({ action }, { state }, 'register Filter')
      return {
        ...state,
        data: Object.assign(initialState.data.filterFns, action.payload.data.filterFns)

      }
    case 'info':
      console.log({ action }, 'registerFilter')
      return {
        ...state,
        data: Object.assign(initialState.data.filterFns, action.payload.data.filterFns)
      }
    case 'warn':
      return {
        ...state,
        data: Object.assign(initialState.data.filterFns, action.payload.data.filterFns)
      }
    case 'error':
      return {
        ...state,
        data: Object.assign(initialState.data.filterFns, action.payload.data.filterFns)
      }
    case 'script':
      return {
        ...state,
        data: Object.assign(initialState.data.filterFns, action.payload.data.filterFns)
      }
    default :
      return { state }
  }
}

export const addCommandHistoryReducer = (state, action) => {
  switch (action.type) {
    case 'cmdHistory':
      console.log({ action }, { state }, 'cmd history')
      return {
        ...state,
        _commandHistory: initialState._commandHistory.unshift(action.payload.script)

      }
    default :
      return { state }
  }
}

export const registerScriptRunnerReducer = (state, action) => {
  console.log({ state }, { action }, 'register script runner reducer')
  switch (action.type) {
    case 'log':
      return {
        ...state
        
      }
  }
}
