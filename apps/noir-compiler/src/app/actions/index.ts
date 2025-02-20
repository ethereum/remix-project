import { NoirPluginClient } from "../services/noirPluginClient"
import { AppState } from "../types"

export const compileNoirCircuit = async (plugin: NoirPluginClient, appState: AppState) => {
  if (appState.status !== "compiling") {
    await plugin.compile(appState.filePath)
  } else {
    console.log('Existing noir compilation in progress')
  }
}
