import { Plugin } from '@remixproject/engine'
import { JsonDataRequest, RejectRequest, SuccessRequest } from './abstract-provider'
import { ethers } from 'ethers'
import Web3 from 'web3'

export class InjectedProvider extends Plugin {
  provider: any
  chainName: string
  chainId: string
  rpcUrls: Array<string>

  constructor (profile) {
    super(profile)
    this.provider = new Web3((window as any).ethereum)
  }

  sendAsync (data: JsonDataRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sendAsyncInternal(data, resolve, reject) 
    })
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    // Check the case where current environment is VM on UI and it still sends RPC requests
    // This will be displayed on UI tooltip as 'cannot get account list: Environment Updated !!'
    
    try {
      if ((window as any) && typeof (window as any).ethereum.enable === 'function') (window as any).ethereum.enable()
      await addL2Network(this.chainName, this.chainId, this.rpcUrls)
      const resultData = await this.provider.currentProvider.send(data.method, data.params)
      resolve({ jsonrpc: '2.0', result: resultData.result, id: data.id })
    } catch (error) {
      reject(error)
    }
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