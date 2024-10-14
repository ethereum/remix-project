import Web3, {
  FMT_NUMBER,
  type EthExecutionAPI,
  type SupportedProviders,
  FMT_BYTES,
  type Bytes,
} from 'web3';
import { addHexPrefix, toBytes } from '@ethereumjs/util';
import { execution } from '@remix-project/remix-lib';
import { toBigInt } from 'web3-utils';
import { saveSettings } from '../actions';

const web3 = new Web3();

export const shortenAddress = (address: string, etherBalance?: string) => {
  const len = address.length;

  return (
    address.slice(0, 5) +
    '...' +
    address.slice(len - 5, len) +
    (etherBalance ? ' (' + etherBalance.toString() + ' ether)' : '')
  );
};

async function pause() {
  return await new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
}

async function tryTillReceiptAvailable(txhash: Bytes) {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txhash, {
      number: FMT_NUMBER.NUMBER,
      bytes: FMT_BYTES.HEX,
    });
    if (receipt) {
      if (!receipt.to && !receipt.contractAddress) {
        // this is a contract creation and the receipt doesn't contain a contract address. we have to keep polling...
        console.log(
          'this is a contract creation and the receipt does nott contain a contract address. we have to keep polling...'
        );
        return receipt;
      } else return receipt;
    }
  } catch (e) {
    /* empty */
  }
  await pause();
  // eslint-disable-next-line @typescript-eslint/return-await
  return await tryTillReceiptAvailable(txhash);
}

async function tryTillTxAvailable(txhash: Bytes) {
  try {
    const tx = await web3.eth.getTransaction(txhash, {
      number: FMT_NUMBER.NUMBER,
      bytes: FMT_BYTES.HEX,
    });
    if (tx?.blockHash) return tx;
    return tx;
  } catch (e) {
    /* empty */
  }
  // eslint-disable-next-line @typescript-eslint/return-await
  return await tryTillTxAvailable(txhash);
}

export class TxRunner {
  lastBlock: any;
  currentFork: string;
  listenOnLastBlockId: any;
  mainNetGenesisHash: string | undefined;
  blockGasLimit: any;
  blockGasLimitDefault: any;

  constructor() {
    this.lastBlock = null;
    this.blockGasLimitDefault = 4300000;
    this.blockGasLimit = this.blockGasLimitDefault;
    this.currentFork = 'shanghai';
    this.mainNetGenesisHash =
      '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3';

    this.listenOnLastBlock();

    setInterval(() => {
      this.getAccounts();
    }, 30000);
  }

  setProvider(
    provider: string | SupportedProviders<EthExecutionAPI> | undefined
  ) {
    web3.setProvider(provider);
  }

  getAccounts() {
    saveSettings({ isRequesting: true });
    void web3.eth
      .getAccounts()
      .then(async (accounts) => {
        const loadedAccounts: any = {};
        for (const account of accounts) {
          const balance = await this.getBalanceInEther(account);
          loadedAccounts[account] = shortenAddress(account, balance);
        }
        saveSettings({ loadedAccounts, isRequesting: false });
      })
      .catch((err) => {
        console.log(err);
        saveSettings({ isRequesting: false });
      });
  }

  async getBalanceInEther(address: string) {
    const balance = await web3.eth.getBalance(address);
    return Web3.utils.fromWei(balance.toString(10), 'ether');
  }

  async getGasPrice() {
    return await web3.eth.getGasPrice();
  }

  async runTx(tx: any, gasLimit: any, useCall: boolean) {
    if (useCall) {
      const returnValue = await web3.eth.call({ ...tx, gas: gasLimit });

      return toBytes(addHexPrefix(returnValue));
    }

    const network = await this.detectNetwork();

    const txCopy = {
      ...tx,
      type: undefined,
      maxFeePerGas: undefined,
      gasPrice: undefined,
    };

    if (network?.lastBlock) {
      if (network.lastBlock.baseFeePerGas) {
        // the sending stack (web3.js / metamask need to have the type defined)
        // this is to avoid the following issue: https://github.com/MetaMask/metamask-extension/issues/11824
        txCopy.type = '0x2';
        txCopy.maxFeePerGas = Math.ceil(
          Number(
            (
              toBigInt(network.lastBlock.baseFeePerGas) +
              toBigInt(network.lastBlock.baseFeePerGas) / BigInt(3)
            ).toString()
          )
        );
      } else {
        txCopy.type = '0x1';
        txCopy.gasPrice = undefined;
      }
    }

    try {
      const gasEstimation = await web3.eth.estimateGas(txCopy);
      tx.gas = !gasEstimation ? gasLimit : gasEstimation;
      return await this._executeTx(tx, network);
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  async detectNetwork() {
    const id = Number(await web3.eth.net.getId());
    let name = '';
    if (id === 1) name = 'Main';
    else if (id === 3) name = 'Ropsten';
    else if (id === 4) name = 'Rinkeby';
    else if (id === 5) name = 'Goerli';
    else if (id === 42) name = 'Kovan';
    else if (id === 11155111) name = 'Sepolia';
    else name = 'Custom';

    if (id === 1) {
      const block = await web3.eth.getBlock(0);
      if (block && block.hash !== this.mainNetGenesisHash) name = 'Custom';
      return {
        id,
        name,
        lastBlock: this.lastBlock,
        currentFork: this.currentFork,
      };
    } else {
      return {
        id,
        name,
        lastBlock: this.lastBlock,
        currentFork: this.currentFork,
      };
    }
  }

  stopListenOnLastBlock() {
    if (this.listenOnLastBlockId) clearInterval(this.listenOnLastBlockId);
    this.listenOnLastBlockId = null;
  }

  async _updateChainContext() {
    try {
      const block = await web3.eth.getBlock('latest');
      // we can't use the blockGasLimit cause the next blocks could have a lower limit : https://github.com/ethereum/remix/issues/506
      this.blockGasLimit = block?.gasLimit
        ? Math.floor(
          Number(web3.utils.toNumber(block.gasLimit)) -
              (5 * Number(web3.utils.toNumber(block.gasLimit))) / 1024
        )
        : web3.utils.toNumber(this.blockGasLimitDefault);
      this.lastBlock = block;
      try {
        this.currentFork = execution.forkAt(
          await web3.eth.net.getId(),
          block.number
        );
      } catch (e) {
        this.currentFork = 'merge';
        console.log(
          `unable to detect fork, defaulting to ${this.currentFork}..`
        );
        console.error(e);
      }
    } catch (e) {
      console.error(e);
      this.blockGasLimit = this.blockGasLimitDefault;
    }
  }

  listenOnLastBlock() {
    this.listenOnLastBlockId = setInterval(() => {
      void this._updateChainContext();
    }, 15000);
  }

  async _executeTx(tx: any, network: any) {
    if (network?.lastBlock?.baseFeePerGas) {
      // the sending stack (web3.js / metamask need to have the type defined)
      // this is to avoid the following issue: https://github.com/MetaMask/metamask-extension/issues/11824
      tx.type = '0x2';
    }

    let currentDateTime = new Date();
    const start = currentDateTime.getTime() / 1000;

    try {
      const { transactionHash } = await web3.eth.sendTransaction(
        tx,
        undefined,
        { checkRevertBeforeSending: false, ignoreGasPricing: true }
      );
      const receipt = await tryTillReceiptAvailable(transactionHash);
      tx = await tryTillTxAvailable(transactionHash);

      currentDateTime = new Date();
      const end = currentDateTime.getTime() / 1000;
      console.log('tx duration', end - start);
      return {
        receipt,
        tx,
        transactionHash: receipt ? receipt.transactionHash : null,
      };
    } catch (error: any) {
      console.log(
        `Send transaction failed: ${error.message} . if you use an injected provider, please check it is properly unlocked. `
      );
      return { error };
    }
  }
}

export default new TxRunner();
