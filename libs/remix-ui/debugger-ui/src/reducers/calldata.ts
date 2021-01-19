interface Action {
    type: string;
    payload: { [key: string]: any };
}

export const initialState = {
  calldata: {},
  isRequesting: false,
  isSuccessful: false,
  hasError: null
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_CALLDATA_REQUEST':
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        hasError: null
      }
    case 'FETCH_CALLDATA_SUCCESS':
      return {
        calldata: action.payload,
        isRequesting: false,
        isSuccessful: true,
        hasError: null
      }
    case 'FETCH_CALLDATA_ERROR':
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        hasError: action.payload
      }
    case 'UPDATE_CALLDATA_REQUEST':
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        hasError: null
      }
    case 'UPDATE_CALLDATA_SUCCESS':
      return {
        calldata: mergeLocals(action.payload, state.calldata),
        isRequesting: false,
        isSuccessful: true,
        hasError: null
      }
    case 'UPDATE_CALLDATA_ERROR':
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        hasError: action.payload
      }
    default:
      throw new Error()
  }
}

function mergeLocals (locals1, locals2) {
  Object.keys(locals2).map(item => {
    if (locals2[item].cursor && (parseInt(locals2[item].cursor) < parseInt(locals1[item].cursor))) {
      locals2[item] = {
        ...locals1[item],
        value: [...locals2[item].value, ...locals1[item].value]
      }
    }
  })
  return locals2
}
