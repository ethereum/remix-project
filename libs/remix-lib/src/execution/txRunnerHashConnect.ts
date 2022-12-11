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
      const parameters = new ContractFunctionParameters();
      for (let index = 0; index < args.funArgs.length; index++) {
        switch (args.funAbi.inputs[index]) {
          case "uint256":
            parameters.addUint256(args.funArgs[index])
            break;
          default:
            parameters.addString(args.funArgs[index])
            break;
        }
      }
      //Create the transaction
      try {
        console.log({
          contractId: args.to,
          function: {
            name: fnName,
            parameters
          }
        });
        let transaction: ContractCallQuery | ContractExecuteTransaction;
        if (args.useCall) {
          transaction = new ContractCallQuery()
            .setContractId(args.to)
            .setMaxQueryPayment(new Hbar(10))
            .setFunction(fnName, parameters)
        } else {
          const gas = 1_000_000;
          transaction = new ContractExecuteTransaction()
            .setContractId(args.to)
            .setFunction(fnName, parameters)
            .setMaxTransactionFee(new Hbar(10))
            .setGas(gas)
          await transaction.freezeWithSigner(this.hashconnect.signer)
        }


        //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
        return transaction
          .executeWithSigner(this.hashconnect.signer)
          .then((res) => {
            console.log({ res });
            callback(null, res);
          }).catch((err) => {
            callback({ err });
            console.log(err)
          });
      } catch (error) {
        return callback(error.message);
      }
      //Request the receipt of the transaction
      // const receipt = this.hashconnect.provider.getTransactionReceipt();

      //Get the transaction consensus status
      // const transactionStatus = receipt.status;

      // console.log("The transaction consensus status is " + transactionStatus);

      // return this.runInNode(args.from, args.to, data, args.value, args.gasLimit, args.useCall, args.timestamp, confirmationCb, gasEstimationForceSend, promptCb, callback)
    }
    return callback('Skipped contract deploy and execution')
  }
}
