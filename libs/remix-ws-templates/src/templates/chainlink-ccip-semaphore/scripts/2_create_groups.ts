import { ethers } from 'ethers'
import { ISemaphoreDeploymentData } from './types/types'

const identities = []
const commmitments = []

const createGroup = async (sempahore_contract_address: any, admin: any, group_id: number) => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)
    console.log('creating semaphore group')
    await contract['createGroup(uint256,uint256,address)'](group_id, '20', admin)
    console.log('group created ', group_id)
}

;(async () => {
    try {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)

        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

        console.log(semaphore_deployment_data.semaphoreAddress)

        const admin = await signer.getAddress()
        const sempahore_contract_address = semaphore_deployment_data.semaphoreAddress

        // create a new group in Semaphore
        const group_id = ethers.BigNumber.from(ethers.utils.randomBytes(32))
        await createGroup(sempahore_contract_address, admin, group_id)

        await remix.call('fileManager', 'setFile', './data/group_id.json', JSON.stringify({group_id}, null, '\t'))

    } catch (e) {
        console.error(e.message)
    }
})()
