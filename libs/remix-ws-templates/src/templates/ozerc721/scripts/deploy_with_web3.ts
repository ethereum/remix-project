import { deploy } from './web3'

(async () => {
    try {
        const result = await deploy('SampleERC721', ['testToken', 'TST'])
        console.log(`address: ${result.address}`)
    } catch (e) {
        console.log(e.message)
    }
})()