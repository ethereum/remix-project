import { ethers, BigNumber, utils } from 'ethers'
import { BigNumberToSignal } from './helpers/convertsignal'
;(async () => {
    const verified_proofs = JSON.parse(await remix.call('fileManager', 'readFile', './build/proofs_verified.json'))

    const cids = []

    for (let proof of verified_proofs) {
        const cid = BigNumberToSignal(proof.args[3].hex)
        const signal = proof.args[4].hex
        cids.push({
            date: Date.now(),
            cid: cid,
            signal
        })
    }

    await remix.call('fileManager', 'setFile', './build/cids.json', JSON.stringify(cids, null, '\t'))
})()
