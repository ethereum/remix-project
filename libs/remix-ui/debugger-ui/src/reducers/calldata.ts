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
      };
    case 'FETCH_CALLDATA_SUCCESS':
      return {
          calldata: action.payload,
          isRequesting: false,
          isSuccessful: true,
          hasError: null
      };
    case 'FETCH_CALLDATA_ERROR':
        return {
            ...state,
            isRequesting: false,
            isSuccessful: false,
            hasError: action.payload
        };
    default:
      throw new Error();
  }
}