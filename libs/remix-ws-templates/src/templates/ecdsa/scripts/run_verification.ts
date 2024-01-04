// @ts-ignore
import { Poseidon, Tree, computeEffEcdsaPubInput } from "@personaelabs/spartan-ecdsa"
// @ts-ignore
import { privateToPublic, hashPersonalMessage, ecsign, utf8ToBytes, bytesToHex } from "@ethereumjs/util"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const snarkjs = require('snarkjs');

const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
}

function getEffEcdsaCircuitInput (privKey, msg) {
  const msgHash = hashPersonalMessage(msg)
  const { v, r: _r, s } = ecsign(msgHash, privKey)
  const r = BigInt('0x' + _r.map(byte => byte.toString(16).padStart(2, '0')).join(''))
  const circuitPubInput = computeEffEcdsaPubInput(r, v, msgHash)

  const input = {
    s: BigInt('0x' + s.map(byte => byte.toString(16).padStart(2, '0')).join('')),
    Tx: circuitPubInput.Tx,
    Ty: circuitPubInput.Ty,
    Ux: circuitPubInput.Ux,
    Uy: circuitPubInput.Uy
  }

  return input
}

(async () => {
  try {
    // @ts-ignore
    const r1csBuffer = await remix.call('fileManager', 'readFile', 'circuits/instances/.bin/pubkey_membership.r1cs', true)
    // @ts-ignore
    const r1cs = new Uint8Array(r1csBuffer)
    // @ts-ignore
    const wasmBuffer = await remix.call('fileManager', 'readFile', 'circuits/instances/.bin/pubkey_membership.wasm', true)
    // @ts-ignore
    const wasm = new Uint8Array(wasmBuffer)
     
    const zkey_final = {
      type: "mem",
      data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/zk_setup.txt')))
    }
    const wtns = { type: "mem" }

    const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/verification_key.json'))
    // Construct the tree
    const poseidon = new Poseidon()

    await poseidon.initWasm()
    
    const nLevels = 10
    const tree = new Tree(nLevels, poseidon)

    console.log('done')

    const privKeys = [
      utf8ToBytes("".padStart(16, "🧙")),
      utf8ToBytes("".padStart(16, "🪄")),
      utf8ToBytes("".padStart(16, "🔮"))
    ]

    // Store public key hashes
    const pubKeyHashes: bigint[] = []

    // Compute public key hashes
    for (const privKey of privKeys) {
      const pubKey = privateToPublic(privKey)
      const pubKeyHex = bytesToHex(pubKey)
      const hexWithoutPrefix = pubKeyHex.startsWith('0x') ? pubKeyHex.slice(2) : pubKeyHex;
      const pubKeyHash = poseidon.hashPubKey(hexWithoutPrefix)
      
      pubKeyHashes.push(pubKeyHash)
    }

    // Insert the pubkey hashes into the tree
    for (const pubKeyHash of pubKeyHashes) {
      tree.insert(pubKeyHash)
    }

    // Sign
    const index = 0; // Use privKeys[0] for proving
    const privKey = privKeys[index]
    const msg = utf8ToBytes("hello world".padStart(16, " "))

    // Prepare signature proof input
    const effEcdsaInput = getEffEcdsaCircuitInput(privKey, msg)

    const merkleProof = tree.createProof(index)

    const signals = {
      ...effEcdsaInput,
      siblings: merkleProof.siblings,
      pathIndices: merkleProof.pathIndices,
      root: tree.root()
    }

    console.log('signals: ', signals)
    
    console.log('calculate')
    await snarkjs.wtns.calculate(signals, wasm, wtns)
    
    // console.log('check')
    // await snarkjs.wtns.check(r1cs, wtns, logger)
    

    // console.log('prove')
    // const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns);
    
    // const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof, logger);
    // console.log('zk proof validity', verified);
    // proof1.root.toString() === publicSignals[0] ? console.log('merkle proof valid') : console.log('merkle proof invalid')

    
    
  } catch (e) {
    console.error(e.message)
  }
})()