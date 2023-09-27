import { CircomPluginClient } from "../services/circomPluginClient"
import { Actions, AppState } from "../types"

export const compileCircuit = async (plugin: CircomPluginClient, appState: AppState, dispatch: React.Dispatch<Actions>) => {
  try {
    if (appState.status !== "compiling") {
      dispatch({ type: 'SET_COMPILER_STATUS', payload: 'compiling' })
      await plugin.compile(appState.filePath, { version: appState.version, prime: appState.primeValue })
      dispatch({ type: 'SET_COMPILER_STATUS', payload: 'idle' })
    } else {
      console.log('Exisiting compilation in progress')
    }
  } catch (e) {
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'errored' })
    console.error('Compiling failed: ', e)
  }
}

export const generateR1cs = async (plugin: CircomPluginClient, appState: AppState, dispatch: React.Dispatch<Actions>) => {
  try {
    if (appState.status !== "generating") {
      dispatch({ type: 'SET_COMPILER_STATUS', payload: 'generating' })
      await plugin.generateR1cs(appState.filePath, { version: appState.version, prime: appState.primeValue })
      dispatch({ type: 'SET_COMPILER_STATUS', payload: 'idle' })
    } else {
      console.log('Exisiting r1cs generation in progress')
    }
  } catch (e) {
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'errored' })
    console.error('Generating R1CS failed: ', e)
  }
}