import { Plugin } from '@remixproject/engine';
import { ContractAST, ContractData } from '../types/contract';

const proxyProfile = {
  name: 'openzeppelin-proxy',
  displayName: 'openzeppelin-proxy',
  description: 'openzeppelin-proxy',
  methods: ['isConcerned', 'execute']
};
const UUPS = '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol'

export class OpenZeppelinProxy extends Plugin {
  blockchain: any
  constructor(blockchain) {
    super(proxyProfile)
    this.blockchain = blockchain
  }

  async isConcerned(ast: ContractAST): Promise<boolean> {
    // check in the AST if it's an upgradable contract
    if (ast.nodes.find(node => node.absolutePath === UUPS)) return true
    return false
  }

  async execute(contractData: ContractData, contractMetadata: any, compiledContracts: any) {
    // deploy the proxy, or use an existing one
  }
}
