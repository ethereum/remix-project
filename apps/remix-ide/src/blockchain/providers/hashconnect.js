
import { HashConnect } from 'hashconnect';
import {
  FileCreateTransaction,
  ContractCreateTransaction,
} from "@hashgraph/sdk";

const appMetadata = {
  name: "Remix dApp",
  description: "Hedera Remix dApp",
  icon: "http://accubits.com/wp-content/uploads/2017/06/logo.png"
}

class HashconnectProvider {
  hashconnect;
  fileReceipt;
  initData;
  signer;
  network = 'testnet'
  signer;
  provider;

  constructor() {
    this.hashconnect = new HashConnect();
  }

  async init() {
    this.initData = await this.hashconnect.init(appMetadata, this.network, true);
    const { pairingString } = this.initData;
    this.hashconnect.foundExtensionEvent.once((walletMetadata) => {
      //do something with metadata
      console.log('walletMetadata', walletMetadata);
      if (this.initData.savedPairings.length === 0) {
        this.hashconnect.connectToLocalWallet();
      }
    })
    this.hashconnect.pairingEvent.once((pairingData) => {
      console.log('pairingData', pairingData)

      const { savedPairings } = this.initData;
      const pairing = savedPairings[0];
      const { topic, accountIds: [accountId] } = pairing;
      //do something with metadata
      this.provider = this.hashconnect.getProvider(this.network, topic, accountId)
      this.signer = this.hashconnect.getSigner(this.provider);;
    })

    this.hashconnect.connectionStatusChangeEvent.once((connectionStatus) => {
      console.log('connectionStatus', connectionStatus)
    })
  }


  async createFile(contractBytecode) {
    //Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = await new FileCreateTransaction()
      //Set the bytecode of the contract
      .setContents(contractBytecode).freezeWithSigner(this.signer);
    //Submit the file to the Hedera test signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.executeWithSigner(this.signer);
    if (!submitTx) {
      throw new Error('File creation failed');
    }
    const receipt = await this.provider.getTransactionReceipt(submitTx.transactionId)
    this.fileReceipt = receipt;
  }

  async deployContract() {
    //Log the file ID
    console.log("The smart contract byte code file ID is " + this.fileReceipt.fileId)
    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
      //Set the file ID of the Hedera file storing the bytecode
      .setBytecodeFileId(this.fileReceipt.fileId)
      .setGas(100000)
      .freezeWithSigner(this.signer)
    //Set the gas to instantiate the contract
    //Provide the constructor parameters for the contract
    // .setConstructorParameters(new ContractFunctionParameters().addString("Hello from Hedera!"));

    //Submit the transaction to the Hedera test
    const contractResponse = await contractTx.executeWithSigner(this.signer);
    const receipt = await this.provider.getTransactionReceipt(contractResponse.transactionId)
    this.contractReceipt = receipt;
    return receipt;
  }

  // copied methods


  getAccounts(cb) {
    return this.initData.savedPairings.accountIds;
  }

}


module.exports = HashconnectProvider;
