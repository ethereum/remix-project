import { execution } from '@remix-project/remix-lib'
const { txFormat } = execution
import { Plugin } from '@remixproject/engine';
import { ContractData } from '../types/contract';

const profileDeployLibraries = {
  name: 'deploy-libraries',
  displayName: 'deploy-libraries',
  description: 'deploy-libraries',
  methods: ['isConcerned', 'execute']
};

const profileLinkLibraries = {
  name: 'link-libraries',
  displayName: 'link-libraries',
  description: 'link-libraries',
  methods: ['isConcerned', 'execute']
};

export class DeployLibraries extends Plugin {
  blockchain: any

  constructor(blockchain) {
    super(profileDeployLibraries)
    this.blockchain = blockchain
  }

  async isConcerned(contractData: ContractData): Promise<boolean> {
    return Object.keys(contractData.bytecodeLinkReferences).length > 0;
  }

  execute(contractData: ContractData, contractMetadata: any, compiledContracts: any) {
    // we deploy libraries
    // and return the linked bytecode
    return new Promise((resolve, reject) => {
      txFormat.linkBytecode(contractData.object, compiledContracts, (error, bytecode) => {
        if (error) return reject (error)
        // final Callback
        resolve(bytecode)
      },
      (message) => {
        // step Callback
        console.log(message)
      }, (data, runTxCallback) => {
        // deploy library Callback
        // called for libraries deployment
        this.blockchain.runTx(data, () => {}, () => {}, () => {}, runTxCallback)
      })
    })
  }
}

export class LinkLibraries extends Plugin {
  blockchain: any
  constructor(blockchain) {
    super(profileLinkLibraries)
    this.blockchain = blockchain
  }

  async isConcerned(contractData: ContractData): Promise<boolean> {
    return Object.keys(contractData.bytecodeLinkReferences).length > 0;
  }

  execute(contractData: ContractData, contractMetadata: any, compiledContracts: any) {
    // we just link libraries
    // and return the linked bytecode
    return new Promise((resolve, reject) => {
      txFormat.linkLibraries(contractData, contractMetadata.linkReferences, contractData.bytecodeLinkReferences, (error, bytecode) => {
        if (error) return reject(error)
        resolve(bytecode)
      })
    })
  }
}
