import { ethers, BigNumber } from 'ethers'
import { ISemaphoreDeploymentData, IGroup, IGroupMember } from './types/types'
;(async () => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
    console.log(await signer.getAddress())
    const signerAddress = await signer.getAddress()

    const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
    const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)

    const contract = await ethers.getContractAt('Semaphore', semaphore_deployment_data.semaphoreAddress, signer)

    //console.log(contract.filters)

    let eventFilter = contract.filters.GroupCreated()
    let groupsCreated = await contract.queryFilter(eventFilter)

    const groupIds: any = []

    for (let groupCreated of groupsCreated) {
        console.log(groupCreated)
        const group = await contract.groups(groupCreated.args[0])

        if (group[0] == signerAddress) {
            console.log('found group belonging to ' + signerAddress + 'group id ' + groupCreated.args[0])
            groupIds.push(groupCreated.args[0])
        }
    }

    eventFilter = contract.filters.MemberAdded()
    let membersAdded = await contract.queryFilter(eventFilter)

    const groups: IGroup[] = []

    for (let groupId of groupIds) {
        console.log('checking group members of group ' + groupId)

        const group: IGroup = {
            group_id: groupId.toString(),
            members: [],
        }

        for (let member of membersAdded) {
            if (member.args[0].toHexString() == BigNumber.from(groupId).toHexString()) {
                console.log('found member ')
                console.log(member.args[2].toString())
                group.members.push(member.args[2].toString())
            }
        }

        groups.push(group)
    }

    console.log('groups:')
    console.log(groups)

    await remix.call('fileManager', 'setFile', './build/groups.json', JSON.stringify(groups, null, '\t'))
})()
