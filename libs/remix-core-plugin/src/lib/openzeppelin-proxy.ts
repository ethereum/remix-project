import { Plugin } from '@remixproject/engine';
import { ContractABI, ContractAST, DeployOption } from '../types/contract';
import { UUPS, UUPSABI, UUPSBytecode, UUPSfunAbi } from './constants/uups';

const proxyProfile = {
  name: 'openzeppelin-proxy',
  displayName: 'openzeppelin-proxy',
  description: 'openzeppelin-proxy',
  methods: ['isConcerned', 'execute', 'getDeployOptions']
};
export class OpenZeppelinProxy extends Plugin {
  blockchain: any
  kind: 'UUPS' | 'Transparent'
  constructor(blockchain) {
    super(proxyProfile)
    this.blockchain = blockchain
  }

  async isConcerned(ast: ContractAST = {} as ContractAST): Promise<boolean> {
    // check in the AST if it's an upgradable contract
    if (ast.nodes && ast.nodes.find(node => node.absolutePath && node.absolutePath.includes(UUPS))) {
      this.kind = 'UUPS'
      return true
    }
    //
    // else if transparent contract run check true/false
    //
    return false
  }

  async getDeployOptions (contracts: ContractABI): Promise<{ [name: string]: DeployOption }> {
    const inputs = {}

    if (this.kind === 'UUPS') {
      Object.keys(contracts).map(name => {
        const abi = contracts[name].abi
        const initializeInput = abi.find(node => node.name === 'initialize')

        if (initializeInput) {
          inputs[name] = {
            inputs: initializeInput,
            initializeInputs: this.blockchain.getInputs(initializeInput)
          }
        }
      })
    }
    return inputs
  }

  async execute(implAddress: string, args: string | string [] = '', initializeABI, implementationContractObject): Promise<void> {
    // deploy the proxy, or use an existing one
    if (!initializeABI) throw new Error('Cannot deploy proxy: Missing initialize ABI')
    args = args === '' ? [] : args
    const _data = await this.blockchain.getEncodedFunctionHex(args || [], initializeABI)

    if (this.kind === 'UUPS') this.deployUUPSProxy(implAddress, _data, implementationContractObject)
  }

  async deployUUPSProxy (implAddress: string, _data: string, implementationContractObject): Promise<void> {
    const args = [implAddress, _data]
    const constructorData = await this.blockchain.getEncodedParams(args, UUPSfunAbi)
    const proxyName = 'ERC1967Proxy'
    const data = {
      contractABI: UUPSABI,
      contractByteCode: UUPSBytecode,
      contractName: proxyName,
      funAbi: UUPSfunAbi,
      funArgs: args,
      linkReferences: {},
      dataHex: UUPSBytecode + constructorData.replace('0x', '')
    }

    // re-use implementation contract's ABI for UI display in udapp and change name to proxy name.
    implementationContractObject.name = proxyName
    this.blockchain.deployProxy(data, implementationContractObject)
  }
}
