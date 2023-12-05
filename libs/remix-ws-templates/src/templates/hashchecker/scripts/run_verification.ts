import { poseidon } from "circomlibjs" // v0.0.8

// eslint-disable-next-line @typescript-eslint/no-var-requires
const snarkjs = require('snarkjs');

const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
}

(async () => {
  try {
    // @ts-ignore
    const r1csBuffer = await remix.call('fileManager', 'readFile', 'circuits/.bin/calculate_hash.r1cs', true);
    // @ts-ignore
    const r1cs = new Uint8Array(r1csBuffer);
    // @ts-ignore
    const wasmBuffer = await remix.call('fileManager', 'readFile', 'circuits/.bin/calculate_hash.wasm', true);
    // @ts-ignore
    const wasm = new Uint8Array(wasmBuffer);   
     
    const zkey_final = {
      type: "mem",
      data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/zk_setup.txt')))
    }
    const wtns = { type: "mem" };   

    const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/verification_key.json'))
  
    const value1 = '1234'
    const value2 = '2'
    const value3 = '3'
    const value4 = '4'
    
    const wrongValue = '5' // put this in the poseidon hash calculation to simulate a non matching hash.

    const signals = {
      value1,
      value2,
      value3,
      value4,
      hash: poseidon([value1, value2, value3, value4])
    }
    
    console.log('calculate')
    await snarkjs.wtns.calculate(signals, wasm, wtns);
    
    console.log('check')
    await snarkjs.wtns.check(r1cs, wtns, logger);
    

    console.log('prove')
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns);
    
    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof, logger);
    console.log('zk proof validity', verified);
    
    
  } catch (e) {
    console.error(e.message)
  }
})()