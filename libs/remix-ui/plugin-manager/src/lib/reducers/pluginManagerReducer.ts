
export type localPluginReducerActionType = {
  type: 'show' | 'close',
  payload?: any
}

export function localPluginToastReducer (currentState: string, toastAction: localPluginReducerActionType) {
  switch (toastAction.type) {
    case 'show':
      return `Cannot create Plugin : ${toastAction.payload!}`
    default:
      return currentState
  }
}

export interface activePluginActionType {
  type: 'load' | 'refresh'
}
export function loadActivePluginsReducer (activated: string[], action: activePluginActionType) {

}
