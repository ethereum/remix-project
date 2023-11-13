import { ethers, BigNumber } from 'ethers'
// [1,2,3,4,5,6,7,8]
;(async () => {
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

    const signerAddress = await signer.getAddress()

    const contract = await ethers.getContractAt('HackerGroup', '0x9a2E12340354d2532b4247da3704D2A5d73Bd189', signer)

    //console.log(contract.filters)

    let eventFilter = contract.filters.bugCreated()
    let bugs = await contract.queryFilter(eventFilter)

    console.log('bugs created')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = contract.filters.bugApproved()
    bugs = await contract.queryFilter(eventFilter)

    console.log('bugs approved')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = contract.filters.bugRejected()
    bugs = await contract.queryFilter(eventFilter)

    console.log('bugs rejected')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = contract.filters.messageReceived(null)
    bugs = await contract.queryFilter(eventFilter)

    console.log('message received')
    console.log(JSON.stringify(bugs, null, '\t'))


    eventFilter = contract.filters.TokensTransferred(null)
    bugs = await contract.queryFilter(eventFilter)

    console.log('tokens transferred')
    console.log(JSON.stringify(bugs, null, '\t'))
    
    /*
    const client = await ethers.getContractAt('HackerClient', '0x4a9C121080f6D9250Fc0143f41B595fD172E31bf', signer)

    eventFilter = client.filters.messageSent()
    bugs = await client.queryFilter(eventFilter)

    console.log('message sent')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = client.filters.messageReceived()
    bugs = await client.queryFilter(eventFilter)

    console.log('message received')
    console.log(JSON.stringify(bugs, null, '\t'))

    eventFilter = contract.filters.bugCreated()
    bugs = await client.queryFilter(eventFilter)

    console.log('bugs created')
    console.log(JSON.stringify(bugs, null, '\t'))
    */
    
})()
