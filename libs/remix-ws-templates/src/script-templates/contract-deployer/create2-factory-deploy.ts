import { ethers } from 'ethers'

// https://etherscan.io/address/0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2#code
export const CREATE2_DEPLOYER_ADDRESS = '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2'

/**
 * Deploy the given contract using a factory
 * @param {string} address of the factory contract
 * @param {string} contractName name of the contract to deploy
 * @param {Array<any>} args list of constructor' parameters
 * @param {number} salt (using during address generation)
 * @param {number} accountIndex account index from the exposed account
 * @return {string} deployed contract address
 */
export const deploy = async (contractName: string, args: Array<any>, salt: string, accountIndex?: number): Promise<string> => {
  console.log(`deploying ${contractName}`)

  const signer = new ethers.providers.Web3Provider(web3Provider).getSigner(accountIndex)

  const factory = new ethers.Contract(CREATE2_DEPLOYER_ADDRESS, contractDeployerAbi, signer)
  //@ts-ignore
  const contract = await ethers.getContractFactory(contractName)
  const initCode = contract.getDeployTransaction(args)

  const codeHash = ethers.utils.keccak256(initCode.data)
  const saltBytes = ethers.utils.id(salt)
  const deployedAddress = await factory.computeAddress(saltBytes, codeHash)
  try {
    const tx = await factory.deploy(0, saltBytes, initCode.data)
    await tx.wait()
    return deployedAddress
  } catch (e) {
    console.error(e.message)
    console.error(`Please check a contract isn't already deployed at that address`)
    throw e
  }
}

export const contractDeployerAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'codeHash',
        type: 'bytes32',
      },
    ],
    name: 'computeAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'codeHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'deployer',
        type: 'address',
      },
    ],
    name: 'computeAddressWithDeployer',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'code',
        type: 'bytes',
      },
    ],
    name: 'deploy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
    ],
    name: 'deployERC1820Implementer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'payoutAddress',
        type: 'address',
      },
    ],
    name: 'killCreate2Deployer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
]
