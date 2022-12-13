
import { HashConnect } from 'hashconnect';
import {
  FileCreateTransaction,
  ContractCreateTransaction,
} from "@hashgraph/sdk";

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
  getAccounts(cb) {
    return cb([]);
  }

}


module.exports = HashconnectProvider;
