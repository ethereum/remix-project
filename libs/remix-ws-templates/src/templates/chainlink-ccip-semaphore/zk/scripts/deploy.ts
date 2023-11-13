import { ethers } from 'ethers'

/**
 * Deploy the given contract
 * @param {string} contractName name of the contract to deploy
 * @param {Array<any>} args list of constructor' parameters
 * @param {Number} accountIndex account index from the exposed account
 * @return {Contract} deployed contract
 */
const deploy = async (
    contractName: string,
    args: Array<any>,
    artifactsPathBase: string,
    accountIndex?: number,
): Promise<ethers.Contract> => {
    console.log(`deploying ${contractName}`)
    // Note that the script needs the ABI which is generated from the compilation artifact.
    // Make sure contract is compiled and artifacts are generated
    const artifactsPath = `${artifactsPathBase}/${contractName}.json` // Change this for different path
    console.log(artifactsPath)
    const metadata = JSON.parse(
        await remix.call('fileManager', 'getFile', artifactsPath),
    )

    // 'web3Provider' is a remix global variable object

    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

    let factory

    factory = new ethers.ContractFactory(
        metadata.abi,
        metadata.data.bytecode.object,
        signer,
    )

    const contract = await factory.deploy(...args)

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    console.log(contract.address)
    return contract
}

//0x9d83e140330758a8fFD07F8Bd73e86ebcA8a5692

;(async () => {
    const router = '0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8'
    const link = '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846'
    await deploy('Receiver', [router], 'contracts/artifacts')
    await deploy('Sender', [router, link], 'contracts/artifacts')
    await deploy('TokenTransferor', [router, link], 'contracts/artifacts')
})()
