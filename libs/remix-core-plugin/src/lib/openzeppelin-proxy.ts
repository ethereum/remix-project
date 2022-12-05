import { Plugin } from '@remixproject/engine'
import { ContractAST, ContractSources, DeployOptions } from '../types/contract'
import { EnableProxyURLParam, EnableUpgradeURLParam, UUPS, UUPSABI, UUPSBytecode, UUPSfunAbi, UUPSupgradeAbi } from './constants/uups'

const proxyProfile = {
  name: 'openzeppelin-proxy',
  displayName: 'openzeppelin-proxy',
  description: 'openzeppelin-proxy',
  methods: ['isConcerned', 'executeUUPSProxy', 'executeUUPSContractUpgrade', 'getProxyOptions', 'getUpgradeOptions']
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
    const UUPSSymbol = ast.exportedSymbols && ast.exportedSymbols[UUPS] ? ast.exportedSymbols[UUPS][0] : null

    if (UUPSSymbol) {
      this.kind = 'UUPS'
      return true
    }
    //
    // else if transparent contract run check true/false
    //
    return false
  }

  async getProxyOptions (data: ContractSources, file: string): Promise<{ [name: string]: DeployOptions }> {
    const contracts = data.contracts[file]
    const ast = data.sources[file].ast

    if (this.kind === 'UUPS') {
      const options = await (this.getUUPSContractOptions(contracts, ast, file))

      return options
    }
  }

  async getUUPSContractOptions (contracts, ast, file) {
    const options = {}

    await Promise.all(Object.keys(contracts).map(async (name) => {
      if (ast) {
        const UUPSSymbol = ast.exportedSymbols[UUPS] ? ast.exportedSymbols[UUPS][0] : null

        await Promise.all(ast.absolutePath === file && ast.nodes.map(async (node) => {
          if (node.name === name && node.linearizedBaseContracts.includes(UUPSSymbol)) {
            const abi = contracts[name].abi
            const initializeInput = abi.find(node => node.name === 'initialize')
            const isDeployWithProxyEnabled: boolean = await this.call('config', 'getAppParameter', EnableProxyURLParam) || false
            const isDeployWithUpgradeEnabled: boolean = await this.call('config', 'getAppParameter', EnableUpgradeURLParam) || false
    
            options[name] = {
              options: [{ title: 'Deploy with Proxy', active: isDeployWithProxyEnabled }, { title: 'Upgrade with Proxy', active: isDeployWithUpgradeEnabled }],
              initializeOptions: {
                inputs: initializeInput,
                initializeInputs: initializeInput ? this.blockchain.getInputs(initializeInput) : null
              }
            }
          }
        }))
      }
    }))
    return options
  }

  async executeUUPSProxy(implAddress: string, args: string | string [] = '', initializeABI, implementationContractObject): Promise<void> {
    // deploy the proxy, or use an existing one
    if (!initializeABI) throw new Error('Cannot deploy proxy: Missing initialize ABI')
    args = args === '' ? [] : args
    const _data = await this.blockchain.getEncodedFunctionHex(args || [], initializeABI)

    if (this.kind === 'UUPS') this.deployUUPSProxy(implAddress, _data, implementationContractObject)
  }

  async executeUUPSContractUpgrade (proxyAddress: string, newImplAddress: string, newImplementationContractObject): Promise<void> {
    if (!newImplAddress) throw new Error('Cannot upgrade: Missing implementation address')
    if (!proxyAddress) throw new Error('Cannot upgrade: Missing proxy address')

    if (this.kind === 'UUPS') this.upgradeUUPSProxy(proxyAddress, newImplAddress, newImplementationContractObject)
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
    implementationContractObject.contractName = implementationContractObject.name
    implementationContractObject.implementationAddress = implAddress
    implementationContractObject.name = proxyName
    this.blockchain.deployProxy(data, implementationContractObject)
  }

  async upgradeUUPSProxy (proxyAddress: string, newImplAddress: string, newImplementationContractObject): Promise<void> {
    const fnData = await this.blockchain.getEncodedFunctionHex([newImplAddress], UUPSupgradeAbi)
    const proxyName = 'ERC1967Proxy'
    const data = {
      contractABI: UUPSABI,
      contractName: proxyName,
      funAbi: UUPSupgradeAbi,
      funArgs: [newImplAddress],
      linkReferences: {},
      dataHex: fnData.replace('0x', '')
    }
    // re-use implementation contract's ABI for UI display in udapp and change name to proxy name.
    newImplementationContractObject.contractName = newImplementationContractObject.name
    newImplementationContractObject.implementationAddress = newImplAddress
    newImplementationContractObject.name = proxyName
    this.blockchain.upgradeProxy(proxyAddress, newImplAddress, data, newImplementationContractObject)
  }
}