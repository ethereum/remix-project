import { RequestArguments } from '../types';

class MetaMask {
  async addCustomNetwork(chainId: any) {
    const paramsObj: any = { chainId };
    if (chainId === '0xa') {
      paramsObj.chainName = 'Optimism';
      paramsObj.rpcUrls = ['https://mainnet.optimism.io'];
    }
    if (chainId === '0xa4b1') {
      paramsObj.chainName = 'Arbitrum One';
      paramsObj.rpcUrls = ['https://arb1.arbitrum.io/rpc'];
    }
    if (chainId === '0x50877ed6') {
      paramsObj.chainName = 'SKALE Chaos Testnet';
      paramsObj.rpcUrls = [
        'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix',
      ];
      paramsObj.nativeCurrency = {
        name: 'sFUEL',
        symbol: 'sFUEL',
        decimals: 18,
      };
    }

    const { chainName, rpcUrls, nativeCurrency, blockExplorerUrls } = paramsObj;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          const paramsObj: Record<string, any> = {
            chainId: chainId,
            chainName: chainName,
            rpcUrls: rpcUrls,
          };
          if (nativeCurrency) paramsObj.nativeCurrency = nativeCurrency;
          if (blockExplorerUrls)
            paramsObj.blockExplorerUrls = blockExplorerUrls;
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [paramsObj],
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

  async sendAsync(data: RequestArguments) {
    return new Promise((resolve) => {
      //@ts-expect-error sendAsync is a legacy function we know MetaMask supports it
      window.ethereum.sendAsync(data, (error, response) => {
        if (error) {
          if (
            error.data &&
            error.data.originalError &&
            error.data.originalError.data
          ) {
            resolve({
              jsonrpc: '2.0',
              error: error.data.originalError,
              id: data.id,
            });
          } else if (error.data && error.data.message) {
            resolve({
              jsonrpc: '2.0',
              error: error.data && error.data,
              id: data.id,
            });
          } else {
            resolve({
              jsonrpc: '2.0',
              error,
              id: data.id,
            });
          }
        }
        return resolve(response);
      });
    });
  }
}

export default new MetaMask();
