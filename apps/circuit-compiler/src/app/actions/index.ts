import type { CircomPluginClient } from "../services/circomPluginClient"
import { Actions, AppState } from "../types"

export const compileCircuit = async (plugin: CircomPluginClient, appState: AppState) => {
  try {
    if (appState.status !== "compiling") {
      await plugin.compile(appState.filePath, { version: appState.version, prime: appState.primeValue })
    } else {
      console.log('Exisiting circuit compilation in progress')
    }
  } catch (e) {
    plugin.internalEvents.emit('circuit_compiling_errored', e)
    console.error(e)
  }
}

export const generateR1cs = async (plugin: CircomPluginClient, appState: AppState) => {
  try {
    if (appState.status !== "generating") {
      await plugin.generateR1cs(appState.filePath, { version: appState.version, prime: appState.primeValue })
    } else {
      console.log('Exisiting r1cs generation in progress')
    }
  } catch (e) {
    plugin.internalEvents.emit('circuit_generating_r1cs_errored', e)
    console.error('Generating R1CS failed: ', e)
  }
}

export const computeWitness = async (plugin: CircomPluginClient, status: string, witnessValues: Record<string, string>) => {
  try {
    if (status !== "computing") {
      const input = JSON.stringify(witnessValues)

      await plugin.computeWitness(input)
    } else {
      console.log('Exisiting witness computation in progress')
    }
  } catch (e) {
    plugin.internalEvents.emit('circuit_computing_witness_errored', e)
    console.error('Computing witness failed: ', e)
  }
}
