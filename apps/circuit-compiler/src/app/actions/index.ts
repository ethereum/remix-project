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

export const runSetupAndExport = async (plugin: CircomPluginClient, appState: AppState) => {
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
    if (appState.exportVerificationKey) {
      const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/keys/verification_key.json`, JSON.stringify(vKey, null, 2))
      // @ts-ignore
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/keys/zkey_final.txt`, (zkey_final as any).data, { encoding: null })
    }
    if (appState.exportVerificationContract) {
      const templates = { groth16: GROTH16_VERIFIER }
      const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/groth16/zk/build/zk_verifier.sol`, solidityContract)
    }
  } else if (appState.provingScheme === 'plonk') {
    await snarkjs.plonk.setup(r1cs, ptau_final, zkey_final)
    if (appState.exportVerificationKey) {
      const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/keys/verification_key.json`, JSON.stringify(vKey, null, 2))
      // @ts-ignore
      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/keys/zkey_final.txt`, (zkey_final as any).data, { encoding: null })
    }
    if (appState.exportVerificationContract) {
      const templates = { plonk: PLONK_VERIFIER }
      const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

      await plugin.call('fileManager', 'writeFile', `${extractParentFromKey(appState.filePath)}/plonk/zk/build/zk_verifier.sol`, solidityContract)
    }
  }
}

export const generateProof = async (plugin: CircomPluginClient, appState: AppState) => {
//   try {
//     // @ts-ignore
//     const r1csBuffer = await remix.call('fileManager', 'readFile', 'circuits/.bin/calculate_hash.r1cs', { encoding: null });
//     // @ts-ignore
//     const r1cs = new Uint8Array(r1csBuffer);
//     // @ts-ignore
//     await remix.call('circuit-compiler', 'compile', 'circuits/calculate_hash.circom');
//     // @ts-ignore
//     const wasmBuffer = await remix.call('fileManager', 'readFile', 'circuits/.bin/calculate_hash.wasm', { encoding: null });
//     // @ts-ignore
//     const wasm = new Uint8Array(wasmBuffer);

//     const zkey_final = {
//       type: "mem",
//       data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', 'scripts/groth16/zk/keys/zkey_final.txt')))
//     }
//     const wtns = { type: "mem" };

//     const vKey = JSON.parse(await remix.call('fileManager', 'readFile', 'scripts/groth16/zk/keys/verification_key.json'))

//     const value1 = '1234'
//     const value2 = '2'
//     const value3 = '3'
//     const value4 = '4'

//     const wrongValue = '5' // put this in the poseidon hash calculation to simulate a non matching hash.

//     const signals = {
//       value1,
//       value2,
//       value3,
//       value4,
//       hash: poseidon([value1, value2, value3, value4])
//     }

//     console.log('calculate')
//     await snarkjs.wtns.calculate(signals, wasm, wtns);

//     console.log('check')
//     await snarkjs.wtns.check(r1cs, wtns, logger);

//     console.log('prove')
//     const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns);

//     const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof, logger);
//     console.log('zk proof validity', verified);

//     const templates = {
//       groth16: await remix.call('fileManager', 'readFile', 'templates/groth16_verifier.sol.ejs')
//     }
//     const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)

//     await remix.call('fileManager', 'writeFile', 'scripts/groth16/zk/build/zk_verifier.sol', solidityContract)
//     await remix.call('fileManager', 'writeFile', 'scripts/groth16/zk/build/input.json', JSON.stringify({
//       _pA: [proof.pi_a[0], proof.pi_a[1]],
//       _pB: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
//       _pC: [proof.pi_c[0], proof.pi_c[1]],
//       _pubSignals: publicSignals,
//     }, null, 2))
// } catch (e) {
// }
}
