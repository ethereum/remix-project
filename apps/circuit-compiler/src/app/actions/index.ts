import { CircomPluginClient } from "../services/circomPluginClient"
import { Actions, AppState } from "../types"

export const compileCircuit = async (plugin: CircomPluginClient, appState: AppState, dispatch: React.Dispatch<Actions>) => {
  try {
    if (appState.status !== "compiling") {
      await plugin.compile(appState.filePath, { version: appState.version, prime: appState.primeValue })
    } else {
      console.log('Exisiting circuit compilation in progress')
    }
  } catch (e) {
    console.error(e)
    dispatch({ type: 'SET_SIGNAL_INPUTS', payload: [] })
  }
}

export const generateR1cs = async (plugin: CircomPluginClient, appState: AppState, dispatch: React.Dispatch<Actions>) => {
  try {
    if (appState.status !== "generating") {
      await plugin.generateR1cs(appState.filePath, { version: appState.version, prime: appState.primeValue })
    } else {
      console.log('Exisiting r1cs generation in progress')
    }
  } catch (e) {
    console.error('Generating R1CS failed: ', e)
  }
}