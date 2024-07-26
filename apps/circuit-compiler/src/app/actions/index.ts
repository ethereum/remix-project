import * as snarkjs from 'snarkjs'
import type { CircomPluginClient } from "../services/circomPluginClient"
import { AppState } from "../types"
import { GROTH16_VERIFIER, PLONK_VERIFIER } from './constant'
import { extractNameFromKey, extractParentFromKey } from '@remix-ui/helper'

export const compileCircuit = async (plugin: CircomPluginClient, appState: AppState) => {
  try {
    if (appState.status !== "compiling") {
      await plugin.compile(appState.filePath, { version: appState.version, prime: appState.primeValue })
    } else {
      console.log('Existing circuit compilation in progress')
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
      console.log('Existing r1cs generation in progress')
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
      console.log('Existing witness computation in progress')
    }
  } catch (e) {
    plugin.internalEvents.emit('circuit_computing_witness_errored', e)
    console.error('Computing witness failed: ', e)
  }
}

export const runSetupAndExport = async (plugin: CircomPluginClient, appState: AppState) => {
  const ptau_final = `https://ipfs-cluster.ethdevops.io/ipfs/${appState.ptauList.find(ptau => ptau.name === appState.ptauValue)?.ipfsHash}`
  if (appState.status !== "generating") await plugin.generateR1cs(appState.filePath, { version: appState.version, prime: appState.primeValue })

  const fileName = extractNameFromKey(appState.filePath)
  const readPath = extractParentFromKey(appState.filePath) + `/.bin/${fileName.replace('.circom', '.r1cs')}`
  // @ts-ignore
  const r1csBuffer = await plugin.call('fileManager', 'readFile', readPath, { encoding: null })
  // @ts-ignore
  const r1cs = new Uint8Array(r1csBuffer)
  const zkey_final = { type: "mem" }

  if (appState.provingScheme === 'groth16') {
    console.log('running groth16 setup')
    await snarkjs.zKey.newZKey(r1cs, ptau_final, zkey_final)
    if (appState.exportVerificationKey) {
      console.log('exportVerificationKey')
      const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/keys/verification_key.json`, JSON.stringify(vKey, null, 2))
    }
    if (appState.exportVerificationContract) {
      console.log('exportVerificationContract')
      const templates = { groth16: GROTH16_VERIFIER }
      const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/build/zk_verifier.sol`, solidityContract)
    }
  } else if (appState.provingScheme === 'plonk') {
    console.log('running plonk setup')
    await snarkjs.plonk.setup(r1cs, ptau_final, zkey_final)
    if (appState.exportVerificationKey) {
      console.log('exportVerificationKey')
      const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/keys/verification_key.json`, JSON.stringify(vKey, null, 2))
    }
    if (appState.exportVerificationContract) {
      console.log('exportVerificationContract')
      const templates = { plonk: PLONK_VERIFIER }
      const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/build/zk_verifier.sol`, solidityContract)
    }
  }
}
