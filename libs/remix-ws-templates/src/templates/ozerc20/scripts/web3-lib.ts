import Web3 from 'web3-lib'

export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<any> => {

    const web3 = new Web3(window.web3Provider)
    console.log(`deploying ${contractName}`)
    // Note that the script needs the ABI which is generated from the compilation artifact.
    // Make sure contract is compiled and artifacts are generated
    const artifactsPath = `browser/contracts/artifacts/${contractName}.json`

    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))

    const accounts = await web3.eth.getAccounts()

    let contract = new web3.eth.Contract(metadata.abi)

    contract = contract.deploy({
        data: metadata.data.bytecode.object,
        arguments: args
    })

    const newContractInstance = await contract.send({
        from: from || accounts[0],
        gas: gas || 1500000
    })
    return newContractInstance.options    
}