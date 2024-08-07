import * as snarkjs from 'snarkjs'
import type { CircomPluginClient } from "../services/circomPluginClient"
import { AppState, ICircuitAppContext } from "../types"
import { GROTH16_VERIFIER, PLONK_VERIFIER } from './constant'
import { extractNameFromKey, extractParentFromKey } from '@remix-ui/helper'
import { ethers } from 'ethers'

export const compileCircuit = async (plugin: CircomPluginClient, appState: AppState) => {
  try {
    if (appState.status !== "compiling") {
      await plugin.compile(appState.filePath, { version: appState.version, prime: appState.primeValue })
    } else {
      console.log('Existing circuit compilation in progress')
    }
  } catch (e) {
    plugin.emit('statusChanged', { key: 'error', title: e.message, type: 'error' })
    plugin.internalEvents.emit('circuit_compiling_errored', e)
    console.error(e)
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
    plugin.emit('statusChanged', { key: 'error', title: e.message, type: 'error' })
    plugin.internalEvents.emit('circuit_computing_witness_errored', e)
    console.error('Computing witness failed: ', e)
  }
}

export const runSetupAndExport = async (plugin: CircomPluginClient, appState: AppState, dispatch: ICircuitAppContext['dispatch']) => {
  try {
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'exporting' })
    const ptau_final = `https://ipfs-cluster.ethdevops.io/ipfs/${appState.ptauList.find(ptau => ptau.name === appState.ptauValue)?.ipfsHash}`
    await plugin.generateR1cs(appState.filePath, { version: appState.version, prime: appState.primeValue })

    const fileName = extractNameFromKey(appState.filePath)
    const readPath = extractParentFromKey(appState.filePath) + `/.bin/${fileName.replace('.circom', '.r1cs')}`
    // @ts-ignore
    const r1csBuffer = await plugin.call('fileManager', 'readFile', readPath, { encoding: null })
    // @ts-ignore
    const r1cs = new Uint8Array(r1csBuffer)
    const zkey_final = { type: "mem" }

    if (appState.provingScheme === 'groth16') {
      await snarkjs.zKey.newZKey(r1cs, ptau_final, zkey_final)
      await snarkjs.zKey.verifyFromR1cs(r1cs, ptau_final, zkey_final)
      const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)

      if (appState.exportVerificationKey) {
        await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/keys/verification_key.json`, JSON.stringify(vKey, null, 2))
      }
      if (appState.exportVerificationContract) {
        const templates = { groth16: GROTH16_VERIFIER }
        const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

        await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/build/zk_verifier.sol`, solidityContract)
      }
      dispatch({ type: 'SET_ZKEY', payload: zkey_final })
      dispatch({ type: 'SET_VERIFICATION_KEY', payload: vKey })
    } else if (appState.provingScheme === 'plonk') {
      await snarkjs.plonk.setup(r1cs, ptau_final, zkey_final)
      const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)

      if (appState.exportVerificationKey) {
        await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/keys/verification_key.json`, JSON.stringify(vKey, null, 2))
      }
      if (appState.exportVerificationContract) {
        const templates = { plonk: PLONK_VERIFIER }
        const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

        await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/build/zk_verifier.sol`, solidityContract)
      }
      dispatch({ type: 'SET_ZKEY', payload: zkey_final })
      dispatch({ type: 'SET_VERIFICATION_KEY', payload: vKey })
    }
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'idle' })
    dispatch({ type: 'SET_SETUP_EXPORT_STATUS', payload: 'done' })
  } catch (e) {
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'errored' })
    dispatch({ type: 'SET_SETUP_EXPORT_FEEDBACK', payload: e.message })
    console.error(e)
  }
}

export const generateProof = async (plugin: CircomPluginClient, appState: AppState, dispatch: ICircuitAppContext['dispatch']) => {
  try {
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'proving' })
    const fileName = extractNameFromKey(appState.filePath)
    const r1csPath = extractParentFromKey(appState.filePath) + `/.bin/${fileName.replace('.circom', '.r1cs')}`
    // @ts-ignore
    const r1csBuffer = await plugin.call('fileManager', 'readFile', r1csPath, { encoding: null })
    // @ts-ignore
    const r1cs = new Uint8Array(r1csBuffer)
    const wtnsPath = r1csPath.replace('.r1cs', '.wtn')
    // @ts-ignore
    const wtnsBuffer = await plugin.call('fileManager', 'readFile', wtnsPath, { encoding: null })
    // @ts-ignore
    const wtns = new Uint8Array(wtnsBuffer)
    const zkey_final = appState.zKey
    const vKey = appState.verificationKey

    await snarkjs.wtns.check(r1cs, wtns)
    if (appState.provingScheme === 'groth16') {
      const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns)
      const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof)

      console.log('zk proof validity', verified)
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/build/input.json`, JSON.stringify({
        _pA: [proof.pi_a[0], proof.pi_a[1]],
        _pB: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
        _pC: [proof.pi_c[0], proof.pi_c[1]],
        _pubSignals: publicSignals,
      }, null, 2))
    } else if (appState.provingScheme === 'plonk') {
      const { proof, publicSignals } = await snarkjs.plonk.prove(zkey_final, wtns)
      const verified = await snarkjs.plonk.verify(vKey, publicSignals, proof)

      console.log('zk proof validity', verified)
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/build/input.json`, JSON.stringify({
        _proof: [
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.A[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.A[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.B[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.B[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.C[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.C[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Z[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Z[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T1[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T1[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T2[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T2[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T3[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.T3[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxi[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxi[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxiw[0]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.Wxiw[1]).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_a).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_b).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_c).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_s1).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_s2).toHexString(), 32),
          ethers.utils.hexZeroPad(ethers.BigNumber.from(proof.eval_zw).toHexString(), 32),
        ],
        _pubSignals: publicSignals
      }, null, 2))
      dispatch({ type: 'SET_COMPILER_STATUS', payload: 'idle' })
      dispatch({ type: 'SET_PROOF_FEEDBACK', payload: null })
    }
  } catch (e) {
    dispatch({ type: 'SET_COMPILER_STATUS', payload: 'errored' })
    dispatch({ type: 'SET_PROOF_FEEDBACK', payload: e.message })
    console.error(e)
  }
}
