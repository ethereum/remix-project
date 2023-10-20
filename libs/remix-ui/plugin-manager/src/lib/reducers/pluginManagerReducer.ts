
export type localPluginReducerActionType = {
  type: 'show' | 'close',
  payload?: any
}

export function localPluginToastReducer (currentState: string, toastAction: localPluginReducerActionType) {
  switch (toastAction.type) {
  case 'show':
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return `Cannot create Plugin : ${toastAction.payload!}`
  default:
    return currentState
  }
}
