'use strict'
import { EventManager } from '../eventManager'
import { HashConnect } from "hashconnect";
import {
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  Hbar
} from "@hashgraph/sdk";
import {
  FileCreateTransaction,
  ContractCreateTransaction,
  ContractCreateFlow,
} from "@hashgraph/sdk";

const appMetaData = {
  name: "Remix dApp",
  description: "Hedera Remix dApp",
  icon: "http://accubits.com/wp-content/uploads/2017/06/logo.png"
}

const initialData = {
  topic: "",
  pairingString: "",
  encryptionKey: "",
  pairingData: [],
};

export class TxRunnerHedera {
  event

  metadata;
  status = "Disconnected"; //do we even need this?
  hcData = { ...initialData }
  accountId = "";
  hashconnect = new HashConnect();

  constructor() {
    this.metadata = appMetaData;

    this.event = new EventManager()

  }


  async init() {
    this.hashconnect = new HashConnect();
    const initData = await this.hashconnect.init(this.metadata, "testnet", true);
    console.log('initData', initData)
    this.hashconnect.foundExtensionEvent.once((walletMetadata) => {
      console.log('walletMetadata', walletMetadata);
      if (initData.savedPairings.length === 0) {
        this.hashconnect.connectToLocalWallet();
      } else {
        this.hcData.topic = initData.savedPairings[0].topic;
        this.hcData.encryptionKey = initData.savedPairings[0].encryptionKey;
        this.accountId = initData.savedPairings[0].accountIds[0];
      }
    })

    this.hashconnect.pairingEvent.once((pairingData) => {
      console.log('pairingData', pairingData)
    })
    this.hashconnect.acknowledgeMessageEvent.once((acknowledgeData) => {
      console.log('acknowledgeData', acknowledgeData)
    })
    return initData
  }

  async execute(args, confirmationCb, gasEstimationForceSend, promptCb, callback) {
    const initData = await this.init();
    const provider = this.hashconnect.getProvider('testnet', initData.savedPairings[0].topic, initData.savedPairings[0].accountIds[0])
    const signer = this.hashconnect.getSigner(provider);;
    if (args.contractBytecode) {
      const fileCreateTx = await new FileCreateTransaction()
        //Set the bytecode of the contract
        .setContents(args.contractBytecode).freezeWithSigner(signer);
      //Submit the file to the Hedera test signing with the transaction fee payer key specified with the client
      const submitTx = await fileCreateTx.executeWithSigner(signer);
      if (!submitTx) {
        throw new Error('File creation failed');
      }
      const fileReceipt = await provider.getTransactionReceipt(submitTx.transactionId)
      let retryCount = 3;
      let contractResponse;
      do {
        const contractTx = await new ContractCreateTransaction()
          //Set the file ID of the Hedera file storing the bytecode
          .setBytecodeFileId(fileReceipt.fileId)
          .setGas(100000)
          .freezeWithSigner(signer)
        //Submit the transaction to the Hedera test
        contractResponse = await contractTx.executeWithSigner(signer);
        console.log(contractResponse);
        retryCount--;
      } while (!contractResponse && retryCount > 0)
      // Retry
      const contractReceipt = await provider.getTransactionReceipt(contractResponse.transactionId)
      return callback(null, {
        receipt: {
          ...contractReceipt,
          contractId: contractReceipt.contractId.toString(),
          contractAddress: contractReceipt.contractId.toSolidityAddress()
        }
      });
    }
    if (args.to) {
      const fnName = args.funAbi.name;
      const parameters = args.funAbi.inputs.length > 0 ? new ContractFunctionParameters() : null;
      for (let index = 0; index < args.funAbi.inputs.length; index++) {
        switch (args.funAbi.inputs[index].type) {
          case "uint256":
            console.log('uint256', args.funArgs[index])
            parameters.addUint256(args.funArgs[index])
            break;
          default:
            console.log('string', args.funArgs[index])
            parameters.addString(args.funArgs[index])
            break;
        }
      }
      //Create the transaction
      try {
        const gas = 100_000;
        if (args.useCall) {
          const contractCallQuery = new ContractCallQuery()
            .setContractId(args.to)
            .setGas(gas)
            .setFunction(fnName, parameters)
            .setQueryPayment(new Hbar(10))
          const transactionQuery = {
            topic: initData.topic,
            byteArray: contractCallQuery.toBytes(),
            metadata: {
              accountToSign: initData.savedPairings[0].accountIds[0],
              getRecord: false,
              returnTransaction: false,
              hideNft: false
            }
          }
          const response = await this.hashconnect.sendTransaction(initData.topic, transactionQuery)
          console.log(response)
          return callback(null, response);
        }
        const transaction = await new ContractExecuteTransaction()
          .setContractId(args.to)
          .setFunction(fnName, parameters)
          .setMaxTransactionFee(new Hbar(20))
          .setGas(gas).freezeWithSigner(signer)
        const submitTx = await transaction
          .executeWithSigner(signer);
        callback(null, submitTx);
      } catch (error) {
        return callback(error.message);
      }
    }
    return callback('Skipped contract deploy and execution')
  }
}
