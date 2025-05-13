import { deploy } from './deploy'

(async () => {
  try {
    const accountWithToken = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
    const accountNullBalance = '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'

    // deploy ERC20
    const erc20 = await deploy('MyToken', ['0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'])
    console.log(`MyToken address: ${erc20.address}`)

    // deploy Spender
    const spender = await deploy('Spender', [erc20.address])
    console.log(`Spender address: ${spender.address}`)

    // mint 1000000 token to 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
    await (await erc20.mint(accountWithToken, 1000000))

    // check
    console.log('balance', (await erc20.balanceOf(accountWithToken)).toString())

    // encode call 1 : Approve Spender to spend 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4 balance (1000000)
    const data1 = erc20.interface.encodeFunctionData('approve', [spender.address, 1000000])
    // encode call 2 : Use Spender to send 100000 token to 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 from 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4 balance
    const data2 = spender.interface.encodeFunctionData('send', [accountWithToken, accountNullBalance, 10000])

    const executeBatch = [
      [erc20.address, 0, data1],
      [spender.address, 0, data2]
    ]

    console.log(executeBatch)
  } catch (e) {
    console.log(e.message)
  }
})()