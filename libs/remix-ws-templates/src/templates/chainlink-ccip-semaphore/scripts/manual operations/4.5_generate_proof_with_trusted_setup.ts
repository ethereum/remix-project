import { ethers, BigNumber } from 'ethers'
import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'
import { poseidon } from 'circomlibjs' // v0.0.8
const snarkjs = require('snarkjs')
import { Identity } from '@semaphore-protocol/identity'
import { generateProof, verifyProof } from '@semaphore-protocol/proof'
import { utils } from 'ethers'
import packProof from './packProof'
import { Group } from '@semaphore-protocol/group'

const logger = {
    info: (...args) => console.log(...args),
    debug: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
}

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

;(async () => {
    try {
        const topic = 'some topic'
        const message = 'I vote yes'
        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group = new Group(groups[0].group_id, 20, groups[0].members)

        // create idendity from the first member of the group
        const identities = JSON.parse(await remix.call('fileManager', 'readFile', './build/identities.json'))
        console.log('using identity... ')
        console.log(identities[0].commitment)

        const identity = new Identity(identities[0].data)

        const signal = utils.formatBytes32String(message)
        const externalNullifier = utils.formatBytes32String(topic)

        // USE ZK TRUSTED SETUP

        const r1cs = 'https://ipfs-cluster.ethdevops.io/ipfs/QmbMk4ksBYLQzJ6TiZfzaALF8W11xvB8Wz6a2GrG9oDrXW'
        const wasm = 'https://ipfs-cluster.ethdevops.io/ipfs/QmUbpEvHHKaHEqYLjhn93S8rEsUGeqiTYgRjGPk7g8tBbz'

        const zkey_final = {
            type: 'mem',
            data: new Uint8Array(JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/zk_setup.txt'))),
        }
        const wtns = { type: 'mem' }

        const vKey = JSON.parse(await remix.call('fileManager', 'readFile', './zk/build/verification_key.json'))

        // build list of identity commitments
        const identityCommitments = groups[0].members

        console.log('new incremental merkle tree', identityCommitments)

        let tree
        try {
            tree = new IncrementalMerkleTree(poseidon, 20, BigInt(0), 2, identityCommitments) // Binary tree.
        } catch (e) {
            console.error(e.message)
            return
        }

        let proof1 = tree.createProof(0)

        console.log('check index in tree')

        let index = tree.indexOf(identities[0].commitment)

        console.log(index.toString())

        console.log('prepare signals')

        const signals = {
            identityTrapdoor: identity.trapdoor,
            identityNullifier: identity.nullifier,
            treePathIndices: proof1.pathIndices,
            treeSiblings: proof1.siblings,
            externalNullifier: hash(externalNullifier),
            signalHash: hash(signal),
        }

        console.log('calculate')
        await snarkjs.wtns.calculate(signals, wasm, wtns)

        //console.log('check')
        await snarkjs.wtns.check(r1cs, wtns, logger)

        console.log('prove')
        const { proof, publicSignals } = await snarkjs.groth16.prove(zkey_final, wtns)

        const semaphoreProof = {
            merkleTreeRoot: publicSignals[0],
            nullifierHash: publicSignals[1],
            signal: BigNumber.from(signal).toString(),
            externalNullifier: BigNumber.from(externalNullifier).toString(),
            proof: packProof(proof),
        }

        console.log(JSON.stringify(semaphoreProof, null, '\t'))

        const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof, logger)
        console.log('zk proof validity', verified)
        verified ? console.log('merkle proof valid') : console.log('merkle proof invalid')
    } catch (e) {
        console.error(e.message)
    }
})()
