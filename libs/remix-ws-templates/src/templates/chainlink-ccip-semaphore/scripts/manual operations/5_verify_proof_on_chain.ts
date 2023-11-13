import { Group } from '@semaphore-protocol/group'
import { generateProof, verifyProof } from '@semaphore-protocol/proof'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { ISemaphoreDeploymentData } from './types'
;(async () => {
    try {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)
        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

        const sempahore_contract_address = semaphore_deployment_data.semaphoreAddress

        const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)

        // load a proof
        const proofData = JSON.parse(await remix.call('fileManager', 'readFile', 'build/proof.json'))

        const proof = proofData.fullProof
        const group_id = proofData.group_id

        console.log('verifying proof on chain...')
        console.log(proof)

        console.log('using proof ...', group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)

        const result = await contract.verifyProof(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof)
        console.log('verification....')
        console.log(result)
    } catch (e) {
        console.error(e.message)
    }
})()
