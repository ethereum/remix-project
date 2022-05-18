import { deploy } from './ethers'

(async () => {
    try {
        const result = await deploy('SampleERC721', ['testNFT', 'TNFT'])
        console.log(`address: ${result.address}`)
    } catch (e) {
        console.log(e.message)
    }
  })()