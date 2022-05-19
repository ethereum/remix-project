import { deploy } from './web3'

(async () => {
    try {
        const result = await deploy('SampleERC20', ["TestToken", "TST", 18, 1000])
        console.log(`address: ${result.address}`)
    } catch (e) {
        console.log(e.message)
    }
})()