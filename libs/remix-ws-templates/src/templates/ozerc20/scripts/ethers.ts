


export const deploy = async (contractName: string, args: Array<any>, from?: string): Promise<any> => {    

    console.log(`deploying ${contractName}`)
    // Note that the script needs the ABI which is generated from the compilation artifact.
    // Make sure contract is compiled and artifacts are generated
    const artifactsPath = `browser/contracts/artifacts/${contractName}.json`

    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))
    // 'web3Provider' is a remix global variable object
    const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()

    const factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer);

    let contract
    if (from) {
        contract = await factory.connect(from).deploy(...args);
    } else {
        contract = await factory.deploy(...args);
    }    

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    return contract
}