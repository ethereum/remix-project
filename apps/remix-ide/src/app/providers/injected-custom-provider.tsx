import Web3 from 'web3'
import {InjectedProviderDefault} from './injected-provider-default'

export class InjectedCustomProvider extends InjectedProviderDefault {
  chainName: string
  chainId: string
  rpcUrls: Array<string>
  nativeCurrency: Record<string, any>
  blockExplorerUrls: Array<string>

  constructor(provider: any, chainName: string, chainId: string, rpcUrls: Array<string>, nativeCurrency?: Record<string, any>, blockExplorerUrls?: Array<string>) {
    super(provider, chainName)
    this.chainName = chainName
    this.chainId = chainId
    this.rpcUrls = rpcUrls
    this.nativeCurrency = nativeCurrency
    this.blockExplorerUrls = blockExplorerUrls
  }

  async init() {
    if (!this.chainId && this.rpcUrls.length > 0) {
      const chainId = await new Web3(this.rpcUrls[0]).eth.getChainId()
      this.chainId = `0x${chainId.toString(16)}`
    }
    await super.init()
    if (this.chainName && this.rpcUrls && this.rpcUrls.length > 0) await addCustomNetwork(this.chainName, this.chainId, this.rpcUrls, this.nativeCurrency, this.blockExplorerUrls)
    else throw new Error('Cannot add the custom network to main injected provider')
    return {}
  }
}

export const addCustomNetwork = async (chainName: string, chainId: string, rpcUrls: Array<string>, nativeCurrency?: Record<string, any>, blockExplorerUrls?: Array<string>) => {
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{chainId: chainId}]
    })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        const paramsObj: Record<string, any> = {
          chainId: chainId,
          chainName: chainName,
          rpcUrls: rpcUrls,
        }
        if (nativeCurrency) paramsObj.nativeCurrency = nativeCurrency
        if (blockExplorerUrls) paramsObj.blockExplorerUrls = blockExplorerUrls
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [ paramsObj ]
        })

        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: chainId}]
        })
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
  }
}
