export const appInitialState: any = {
  loading: { screen: true },
  remixide: {
    errors: [],
    success: false,
    errorLoadingFile: false,
  },
  workshop: {
    list: [],
    detail: {},
    selectedId: '',
  },
}

export const appReducer = (state = appInitialState, action: any): any => {
  switch (action.type) {
  case 'SET_LOADING':
    return {
      ...state,
      loading: { ...state.loading, ...action.payload },
    }

  case 'SET_REMIXIDE':
    return {
      ...state,
      remixide: { ...state.remixide, ...action.payload },
    }

  case 'SET_WORKSHOP':
    return {
      ...state,
      workshop: { ...state.workshop, ...action.payload },
    }

  default:
    throw new Error()
  }
}
