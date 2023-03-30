import { InjectedProviderDefaultBase } from './injected-provider-default'

export class InjectedL2Provider extends InjectedProviderDefaultBase {    
  chainName: string
  chainId: string
  rpcUrls: Array<string>

  constructor (profile: any, chainName: string, chainId: string, rpcUrls: Array<string>) {
    super(profile)
    this.chainName = chainName
    this.chainId = chainId
    this.rpcUrls = rpcUrls
  }

  async init () {
    await super.init()
    if (this.chainName && this.rpcUrls && this.rpcUrls.length > 0) await addL2Network(this.chainName, this.chainId, this.rpcUrls)
    else
      throw new Error('Cannot add the L2 network to main injected provider')
    return {}
  }
}

export const addL2Network =  async (chainName: string, chainId: string, rpcUrls: Array<string>) => {
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainId,
              chainName: chainName,
              rpcUrls: rpcUrls,
            },
          ],
        });

        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
  }
}