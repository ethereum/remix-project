'use strict'
import { Transaction as Tx } from '@ethereumjs/tx'
import { Block } from '@ethereumjs/block'
import { BN, bufferToHex, Address } from 'ethereumjs-util'
import { vm as remixlibVM } from '@remix-project/remix-lib'
import VM from '@ethereumjs/vm'
import Common from '@ethereumjs/common'

export function sendTx (vm, from, to, value, data, cb) {
  var tx = new Tx({
    nonce: new BN(from.nonce++),
    gasPrice: new BN(1),
    gasLimit: new BN(3000000, 10),
    to: to,
    value: new BN(value, 10),
    data: Buffer.from(data, 'hex')
  })
  tx = tx.sign(from.privateKey)

  var block = Block.fromBlockData({
    header: {
      timestamp: new Date().getTime() / 1000 | 0,
      number: 0
    }
  }) // still using default common

  try {
    vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}).then(function (result) {
      setTimeout(() => {
        cb(null, bufferToHex(tx.hash()))
      }, 500)
    }).catch((error) => {
      console.error(error)
      cb(error)
    })
  } catch (e) {
    console.error(e)
  }
}

async function createVm (hardfork) {
  const common = new Common({ chain: 'mainnet', hardfork })
  const vm = new VM({ common })   
  await vm.init()
  return { vm, stateManager: vm.stateManager }
}

/*
  Init VM / Send Transaction
*/
export async function initVM (st, privateKey) {
  var VM = await createVm('berlin')
  const vm = VM.vm

  var address = Address.fromPrivateKey(privateKey)

  try {
    let account = await vm.stateManager.getAccount(address)
    account.balance = new BN('f00000000000000001', 16)
    await vm.stateManager.putAccount(address, account)
  } catch (error) {
    console.log(error)
  }
  
  var web3Provider = new remixlibVM.Web3VMProvider()
  web3Provider.setVM(vm)
  vm.web3 = web3Provider
  return vm
}

