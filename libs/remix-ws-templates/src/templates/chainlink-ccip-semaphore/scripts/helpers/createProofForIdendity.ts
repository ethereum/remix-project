import { Group } from '@semaphore-protocol/group'
import { generateProof, verifyProof } from '@semaphore-protocol/proof'
import { Identity } from '@semaphore-protocol/identity'
import { BigNumber, utils } from 'ethers'
import { SignalToBigNumber } from '../helpers/convertsignal'
import { IIdentity, SemaphoreProof } from '../types/types'

export const createProofForIdendity = async (_cid: string, _signal: string, writeProof: boolean = true, _prooffile?: string, _commitment?: any): Promise<SemaphoreProof> => {
    if (!_signal || !_cid) throw new Error('message and topic not set')

    const topic = _cid
    const preSignal = _signal

    console.log('topic', topic)
    console.log('message', preSignal)

    // get the idendity
    const identities: IIdentity[] = JSON.parse(await remix.call('fileManager', 'readFile', './build/identities.json'))
    console.log('using identity... ')
    const id = identities.find((i) => i.commitment == _commitment)
    let identity: Identity
    if (id) {
        identity = new Identity(id.data)
    } else {
        identity = new Identity(identities[0].data)
    }

    console.log(identity.commitment.toString())

    // construct the group
    const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))

    const group_with_member = groups.find((g) => {
        return g.members.includes(identity.commitment.toString())
    })

    console.log('found group ... ')
    console.log(group_with_member)

    /* reconstruct the group to use in the Sempaphore proof 
        / this will also create the merkle tree internally in the grouo
        / but you will need to have all the members to do this
        */
    const group = new Group(group_with_member.group_id, 20, group_with_member.members)

    const signal = preSignal
    const externalNullifier = SignalToBigNumber(topic)

    console.log('Creating proof with semaphore')
    /* this was & zkey was taken from https://www.trusted-setup-pse.org/ for a tree depth of 20 only!!
        / generate your own zkeys and wasm files or store them on IPFS
        / the snarkjs implementation that drives this function needs a URL withour CORS limitations, that is why we use IPFS
        */
    const fullProof: SemaphoreProof = await generateProof(identity, group, externalNullifier, signal, {
        zkeyFilePath: 'https://ipfs-cluster.ethdevops.io/ipfs/QmYQU3F6MpxhwAjGLMrcf7Xt2u5PyuS1wrV1Upy1M8xGhL',
        wasmFilePath: 'https://ipfs-cluster.ethdevops.io/ipfs/QmQ8oN5nydG5MwQtxZBVUW5b3E2n41kcbXYUi9wPLFEfqq',
    })
    console.log('Proof created')
    console.log(JSON.stringify(fullProof, null, '\t'))

    // write it to the filesystem
    if (writeProof) {
        await remix.call('fileManager', 'setFile', _prooffile || './build/proof.json', JSON.stringify({fullProof, group_id: group_with_member.group_id}, null, '\t'))
    }
    console.log('verifying proof off chain...')
    const result = await verifyProof(fullProof, 20)

    console.log(result)

    return fullProof
}
