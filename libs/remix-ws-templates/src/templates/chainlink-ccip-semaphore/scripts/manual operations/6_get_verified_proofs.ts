import { ethers, BigNumber } from 'ethers'
import { ISemaphoreDeploymentData, IGroup, IGroupMember } from './types'
;(async () => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    console.log(await signer.getAddress())
    const signerAddress = await signer.getAddress()

    const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
    const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)

    const contract = await ethers.getContractAt('Semaphore', semaphore_deployment_data.semaphoreAddress, signer)

    //console.log(contract.filters)

    let eventFilter = contract.filters.ProofVerified()
    let proofs_verified = await contract.queryFilter(eventFilter)

    console.log(JSON.stringify(proofs_verified, null, '\t'))

    // write it to the filesystem
    await remix.call('fileManager', 'setFile', './build/proofs_verified.json', JSON.stringify(proofs_verified, null, '\t'))
})()
