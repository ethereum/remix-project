let plugin, dispatch: React.Dispatch<any>

const initSettingsTab = (udapp) => async (reducerDispatch: React.Dispatch<any>) => {
  plugin = udapp
  dispatch = reducerDispatch

  
}