import { RemixUiStaticAnalyserReducerActionType, RemixUiStaticAnalyserState } from "../../staticanalyser"

export const initialState: RemixUiStaticAnalyserState = {
  file: '',
  source: null,
  languageVersion: '',
  data: null,
  input: '',
  version: ''
}

export const analysisReducer = (state: RemixUiStaticAnalyserState,
  action: RemixUiStaticAnalyserReducerActionType) => {
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
