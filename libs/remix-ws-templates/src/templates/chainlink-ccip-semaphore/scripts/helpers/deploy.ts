import { ethers } from 'ethers'
/**
 * Deploy the given contract
 * @param {string} contractName name of the contract to deploy
 * @param {Array<any>} args list of constructor' parameters
 * @param {Number} accountIndex account index from the exposed account
 * @return {Contract} deployed contract
 */
export const deploy = async (
    contractName: string,
    args: Array<any>,
    libraries?: { [key: string]: any },
): Promise<ethers.Contract> => {
    console.log(`deploying ${contractName}`)

    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()

    // internal Remix method that resolves the artifacts and links the libraries
    let factory = await ethers.getContractFactory(contractName as any, null, {
        signer,
        libraries,
    } as any)

    const contract = await factory.deploy(...args)

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()

    return contract
}