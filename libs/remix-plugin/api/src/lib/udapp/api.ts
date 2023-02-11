import { RemixTx, RemixTxReceipt, RemixTxEvent, VMAccount, UdappSettings } from './type'
import { StatusEvents } from '@remixproject/plugin-utils'
export interface IUdapp {
  events: {
    newTransaction: (transaction: RemixTxEvent) => void
  } & StatusEvents
  methods: {
    sendTransaction(tx: RemixTx): RemixTxReceipt
    getAccounts(): string[]
    createVMAccount(vmAccount: VMAccount): string
    getSettings(): UdappSettings
    setEnvironmentMode(env: 'vm' | 'injected' | 'web3'): void
  }
}
