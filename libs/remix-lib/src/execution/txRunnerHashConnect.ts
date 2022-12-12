'use strict'
import { EventManager } from '../eventManager'
import {
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  Hbar
} from "@hashgraph/sdk";

export class TxRunnerHashConnect {
  event
  hashconnect;

  constructor(hashconnect) {
    this.event = new EventManager()
    this.hashconnect = hashconnect
  }

  // const hashconnectProvider = new HashConnect()
  // await hashconnectProvider.init();

  async execute(args, confirmationCb, gasEstimationForceSend, promptCb, callback) {
    const signer = this.hashconnect.signer;
    if (!signer) {
      return callback('wallet not connected')
    }
    console.log('Execute')
    if (args.contractBytecode) {
      console.log('Deploy')
      return this.hashconnect.createFile(args.contractBytecode)
        .then((res) => {
          return this.hashconnect.deployContract();
        }).then((res) => {
          callback(null, {
            receipt: {
              ...res,
              contractId: res.contractId.toString(),
              contractAddress: res.contractId.toSolidityAddress()
            }
          });
        })
        .catch((err) => {
          callback('File creation failed' + err?.message)
        })
    }
    console.log({ args });
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
            topic: this.hashconnect.initData.topic,
            byteArray: contractCallQuery.toBytes(),
            metadata: {
              accountToSign: this.hashconnect.initData.savedPairings[0].accountIds[0],
              getRecord: false,
              returnTransaction: false,
              hideNft: false
            }
          }
          const response = await this.hashconnect.hashconnect.sendTransaction(this.hashconnect.initData.topic, transactionQuery)
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
