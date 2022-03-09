export const initialState = {
  file: null,
  source: null,
  languageVersion: null,
  data: null
}

export const analysisReducer = (state, action) => {
  switch (action.type) {
    case 'compilationFinished':
      return {
        ...state,
        file: action.payload.file,
        source: action.payload.source,
        languageVersion: action.payload.languageVersion,
        data: action.payload.data,
        input: action.payload.input,
        version: action.payload.version
      }
    default:
      return initialState
  }
}
