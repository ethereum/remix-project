import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'

import EventManager from 'events'
import { VERIFIERS, type ChainSettings,Chain, type ContractVerificationSettings, type LookupResponse, type VerifierIdentifier, SubmittedContract } from './types'
import { mergeChainSettingsWithDefaults, validConfiguration } from './utils'
import { getVerifier } from './Verifiers'
import { CompilerAbstract } from '@remix-project/remix-solidity'

export class ContractVerificationPluginClient extends PluginClient {
  public internalEvents: EventManager

  constructor() {
    super()
    this.methods = ['lookupAndSave', 'verifyOnDeploy']
    this.internalEvents = new EventManager()
    createClient(this)
    this.onload()
  }

  onActivation(): void {
    this.internalEvents.emit('verification_activated')
  }

  async lookupAndSave(verifierId: string, chainId: string, contractAddress: string): Promise<LookupResponse> {
    const canonicalVerifierId = VERIFIERS.find((id) => id.toLowerCase() === verifierId.toLowerCase())
    if (!canonicalVerifierId) {
      console.error(`lookupAndSave failed: Unknown verifier: ${verifierId}`)
      return
    }

    const userSettings = this.getUserSettingsFromLocalStorage()
    const chainSettings = mergeChainSettingsWithDefaults(chainId, userSettings)

    try {
      const lookupResult = await this.lookup(canonicalVerifierId, chainSettings, chainId, contractAddress)
      await this.saveToRemix(lookupResult)
      return lookupResult
    } catch (err) {
      console.error(`lookupAndSave failed: ${err}`)
    }
  }

  async lookup(verifierId: VerifierIdentifier, chainSettings: ChainSettings, chainId: string, contractAddress: string): Promise<LookupResponse> {
    if (!validConfiguration(chainSettings, verifierId)) {
      throw new Error(`Error during lookup: Invalid configuration given for verifier ${verifierId}`)
    }
    const verifier = getVerifier(verifierId, chainSettings.verifiers[verifierId])
    return await verifier.lookup(contractAddress, chainId)
  }

  async saveToRemix(lookupResponse: LookupResponse): Promise<void> {
    for (const source of lookupResponse.sourceFiles ?? []) {
      try {
        await this.call('fileManager', 'setFile', source.path, source.content)
      } catch (err) {
        throw new Error(`Error while creating file ${source.path}: ${err.message}`)
      }
    }
    try {
      await this.call('fileManager', 'open', lookupResponse.targetFilePath)
    } catch (err) {
      throw new Error(`Error focusing file ${lookupResponse.targetFilePath}: ${err.message}`)
    }
  }

  verifyOnDeploy = async (data: any): Promise<void> => {
    try {
      await this.call('terminal', 'log', { type: 'info', value: 'Verification process started...' })

      const { chainId, currentChain, contractAddress, contractName, compilationResult, constructorArgs, etherscanApiKey } = data
      
      if (!currentChain) throw new Error("Chain data was not provided.")

      const submittedContract: SubmittedContract = {
        id: `${chainId}-${contractAddress}`, 
        address: contractAddress,
        chainId: chainId,
        filePath: Object.keys(compilationResult.data.contracts).find(path => path in compilationResult.source.sources),
        contractName: contractName,
        abiEncodedConstructorArgs: constructorArgs,
        date: new Date().toISOString(),
        receipts: []
      }

      const compilerAbstract: CompilerAbstract = compilationResult

      const userSettings = this.getUserSettingsFromLocalStorage()
      const chainSettings = mergeChainSettingsWithDefaults(chainId, userSettings)

      if (validConfiguration(chainSettings, 'Sourcify')) {
        await this._verifyWithProvider('Sourcify', submittedContract, compilerAbstract, chainId, chainSettings)
      }

      if (currentChain.explorers && currentChain.explorers.some(explorer => explorer.name.includes('etherscan'))) {
        if (etherscanApiKey) {
          if (!chainSettings.verifiers.Etherscan) chainSettings.verifiers.Etherscan = {}
          chainSettings.verifiers.Etherscan.apiKey = etherscanApiKey
          await this._verifyWithProvider('Etherscan', submittedContract, compilerAbstract, chainId, chainSettings)
        } else {
          await this.call('terminal', 'log', { type: 'warn', value: 'Etherscan verification skipped: API key not found in global Settings.' })
        }
      }

      if (currentChain.explorers && currentChain.explorers.some(explorer => explorer.name.toLowerCase().includes('routescan'))) {
        await this._verifyWithProvider('Routescan', submittedContract, compilerAbstract, chainId, chainSettings)
      }

      if (currentChain.explorers && currentChain.explorers.some(explorer => explorer.name.includes('blockscout'))) {
        await this._verifyWithProvider('Blockscout', submittedContract, compilerAbstract, chainId, chainSettings)
      }
      
    } catch (error) {
      await this.call('terminal', 'log', { type: 'error', value: `An unexpected error occurred during verification: ${error.message}` })
    }
  }

  private _verifyWithProvider = async (
    providerName: VerifierIdentifier, 
    submittedContract: SubmittedContract, 
    compilerAbstract: CompilerAbstract, 
    chainId: string, 
    chainSettings: ChainSettings
  ): Promise<void> => {
    try {
      if (validConfiguration(chainSettings, providerName)) {
        await this.call('terminal', 'log', { type: 'info', value: `Verifying with ${providerName}...` })
        
        const verifierSettings = chainSettings.verifiers[providerName]
        const verifier = getVerifier(providerName, verifierSettings)
        
        if (verifier && typeof verifier.verify === 'function') {
            const result = await verifier.verify(submittedContract, compilerAbstract)
            
            let successMessage = `${providerName} verification successful! Status: ${result.status}`
            if (result.receiptId) successMessage += `, Receipt ID: ${result.receiptId}`
            await this.call('terminal', 'log', { type: 'info', value: successMessage })
            
            if (result.lookupUrl) {
                await this.call('terminal', 'log', { type: 'html', value: `Check status: <a href="${result.lookupUrl}" target="_blank">${providerName} Link</a>` })
            }
        } else {
            await this.call('terminal', 'log', { type: 'warn', value: `${providerName} verifier is not properly configured or does not support direct verification.` })
        }
      }
    } catch (e) {
      await this.call('terminal', 'log', { type: 'error', value: `${providerName} verification failed: ${e.message}` })
    }
  }

  private getUserSettingsFromLocalStorage(): ContractVerificationSettings {
    const fallbackSettings = { chains: {} }
    try {
      const settings = window.localStorage.getItem("contract-verification:settings")
      return settings ? JSON.parse(settings) : fallbackSettings
    } catch (error) {
      console.error(error)
      return fallbackSettings
    }
  }
}
