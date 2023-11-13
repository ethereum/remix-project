import { ethers, BigNumber } from 'ethers'
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree"
import { poseidon } from "circomlibjs" // v0.0.8
const snarkjs = require('snarkjs');

const logger = {
  info: (...args) => console.log(...args),
  debug: (...args) => console.log(...args)
};

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
function hash(message: any): bigint {
    message = BigNumber.from(message).toTwos(256).toHexString()
    message = ethers.utils.zeroPad(message, 32)
    return BigInt(ethers.utils.keccak256(message)) >> BigInt(8)
}

(async () => {
  try {
    const ptau_final = "https://ipfs-cluster.ethdevops.io/ipfs/QmTiT4eiYz5KF7gQrDsgfCSTRv3wBPYJ4bRN1MmTRshpnW";
    const r1cs = "https://ipfs-cluster.ethdevops.io/ipfs/QmbMk4ksBYLQzJ6TiZfzaALF8W11xvB8Wz6a2GrG9oDrXW";
    const wasm = "https://ipfs-cluster.ethdevops.io/ipfs/QmUbpEvHHKaHEqYLjhn93S8rEsUGeqiTYgRjGPk7g8tBbz";
    const zkey_0 = { type: "mem" };
    const zkey_1 = { type: "mem" };
    const zkey_final = { type: "mem" };

    console.log('newZkey')
    await snarkjs.zKey.newZKey(r1cs, ptau_final, zkey_0);

    console.log('contribute')
    await snarkjs.zKey.contribute(zkey_0, zkey_1, "p2_C1", "pa_Entropy1");

    console.log('beacon')
    await snarkjs.zKey.beacon(zkey_1, zkey_final, "B3", "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20", 10);

    console.log('verifyFromR1cs')
    const verifyFromR1csResult = await snarkjs.zKey.verifyFromR1cs(r1cs, ptau_final, zkey_final);
    console.assert(verifyFromR1csResult);

    console.log('verifyFromInit')
    const verifyFromInit = await snarkjs.zKey.verifyFromInit(zkey_0, ptau_final, zkey_final);
    console.assert(verifyFromInit);

    console.log('exportVerificationKey')
    const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)
    await remix.call('fileManager', 'writeFile', './zk/build/verification_key.json', JSON.stringify(vKey))
    
    const templates = {
      groth16: await remix.call('fileManager', 'readFile', './zk/templates/groth16_verifier.sol.ejs')
    }
    const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)
    
    await remix.call('fileManager', 'writeFile', './zk/build/zk_verifier.sol', solidityContract)
    
    console.log('buffer', (zkey_final as any).data.length)
    await remix.call('fileManager', 'writeFile', './zk/build/zk_setup.txt', JSON.stringify(Array.from(((zkey_final as any).data))))
    
    console.log('setup done.')
    
  } catch (e) {
    console.error(e.message)
  }
})()