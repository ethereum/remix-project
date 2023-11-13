import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { ISemaphoreDeploymentData } from './types/types'

const identities = []
const commmitments = []

const addMembers = async (sempahore_contract_address: any, admin: any, group_id: any, members: string[]) => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)
    console.log('adding members to group', sempahore_contract_address, group_id, members)
    await contract['addMembers(uint256,uint256[])'](group_id.toString(), members)
    console.log('members added')
}

const verifyMemberCount = async (sempahore_contract_address: any, admin: any, group_id: number, memberCount: number) => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    const contract = await ethers.getContractAt('Semaphore', sempahore_contract_address, signer)
    console.log('counting members in group')
    const count = await contract.getNumberOfMerkleTreeLeaves(group_id)

    if (memberCount !== count.toNumber()) {
        console.error('Members not added')
    } else {
        console.log('Members added correctly')
    }
}

;(async () => {
    try {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)

        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

        console.log(semaphore_deployment_data.semaphoreAddress)

        const admin = await signer.getAddress()
        const sempahore_contract_address = semaphore_deployment_data.semaphoreAddress

        // get group id from file
        const group_id = JSON.parse(await remix.call('fileManager', 'readFile', 'data/group_id.json')).group_id.hex.toString()

        //console.log(group_id.hex.toString())

        //return

        // create some random identities
        for (let i = 0; i <= 1; i++) {
            const identity = new Identity()
            const { trapdoor, nullifier, commitment } = identity
            identities.push({
                trapdoor: trapdoor.toString(),
                nullifier: nullifier.toString(),
                commitment: commitment.toString(),
                data: identity.toString(),
                group_id,
            })
            commmitments.push(commitment.toString())
        }

        // store them so we can use them in our dApp, it contains secrets, not for production use
        await remix.call('fileManager', 'setFile', './build/identities.json', JSON.stringify(identities, null, '\t'))

        // add them all to the group
        const r = await addMembers(sempahore_contract_address, admin, group_id, commmitments)

        setTimeout(
            async () =>
                // verify we added them
                await verifyMemberCount(sempahore_contract_address, admin, group_id, commmitments.length),
            20000,
        )
    } catch (e) {
        console.error(e.message)
    }
})()
