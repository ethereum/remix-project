'use strict'

const erc20 = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title SampleERC20
 * @dev Create a sample ERC20 standard token
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SampleERC20 is ERC20 {

    constructor(string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol) {}
}`

const erc20_test = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../contracts/SampleERC20.sol";

contract SampleERC20Test {
   
    SampleERC20 s;
    function beforeAll () public {
        s = new SampleERC20("TestToken", "TST");
    }
    
    function testTokenNameAndSymbol () public {
        Assert.equal(s.name(), "TestToken", "token name did not match");
        Assert.equal(s.symbol(), "TST", "token symbol did not match");
    }
}
`

/* eslint-disable no-useless-escape */
const deployWithWeb3 = `import { deploy } from './web3.ts'

(async () => {
    try {
        const result = await deploy('SampleERC20', ['testToken', 'TST'])
        console.log(\`address: \${result.address\}\`)
    } catch (e) {
        console.log(e.message)
    }
})()`

const deployWithEthers = `import { deploy } from './ethers.ts'

(async () => {
    try {
        const result = await deploy('SampleERC20', ['testToken', 'TST'])
        console.log(\`address: \${result.address\}\`)
    } catch (e) {
        console.log(e.message)
    }
  })()`

const libWeb3 = `
export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number) => {
    
    console.log(\`deploying \${contractName\}\`)
    // Note that the script needs the ABI which is generated from the compilation artifact.
    // Make sure contract is compiled and artifacts are generated
    const artifactsPath = \`browser/contracts/artifacts/\${contractName\}.json\`

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
}: Promise<any>`

const libEthers = `
export const deploy = async (contractName: string, args: Array<any>, from?: string) => {    
    
    console.log(\`deploying \${contractName\}\`)
    // Note that the script needs the ABI which is generated from the compilation artifact.
    // Make sure contract is compiled and artifacts are generated
    const artifactsPath = \`browser/contracts/artifacts/\${contractName\}.json\`

    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))
    // 'web3Provider' is a remix global variable object
    const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()

    let factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer);

    let contract
    if (from) {
        contract = await factory.connect(from).deploy(...args);
    } else {
        contract = await factory.deploy(...args);
    }    

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    return contract
}: Promise<any>`
/* eslint-enable no-useless-escape */




export default {
  erc20: { name: 'contracts/SampleERC20.sol', content: erc20 },
  erc20_test: { name: 'tests/SampleERC20_test.sol', content: erc20_test },
  deployWithWeb3: { name: 'scripts/deploy_with_web3.ts', content: deployWithWeb3 },
  deployWithEthers: { name: 'scripts/deploy_with_ethers.ts', content: deployWithEthers },
  web3: { name: 'scripts/web3.ts', content: libWeb3 },
  ethers: { name: 'scripts/ethers.ts', content: libEthers },
}
