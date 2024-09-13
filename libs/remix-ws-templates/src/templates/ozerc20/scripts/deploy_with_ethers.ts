import { deploy } from './ethers-lib'

(async () => {
  try {
    const result = await deploy('MyToken', [])
    console.log(`address: ${await result.getAddress()}`)
  } catch (e) {
    console.log(e.message)
  }
})()