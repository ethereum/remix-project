import { Plugin } from '@remixproject/engine';
import { ContractData } from '../types/contract';

const proxyProfile = {
  name: 'openzeppelin-proxy',
  displayName: 'openzeppelin-proxy',
  description: 'openzeppelin-proxy',
  methods: ['isConcerned', 'execute']
};

export class OpenZeppelinProxy extends Plugin {
  blockchain: any
  constructor(blockchain) {
    super(proxyProfile)
    this.blockchain = blockchain
  }

  async isConcerned(contractData: ContractData): Promise<boolean> {
    // check in the AST if it's an upgradable contract
    return false
  }

  async execute(contractData: ContractData, contractMetadata: any, compiledContracts: any) {
    // deploy the proxy, or use an existing one
  }
}
