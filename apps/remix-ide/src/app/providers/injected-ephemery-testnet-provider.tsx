import * as packageJson from '../../../../../package.json'
import { InjectedCustomProvider } from './injected-custom-provider'
import Web3 from 'web3'

const profile = {
  name: 'injected-ephemery-testnet-provider',
  displayName: 'Injected Ephemery Testnet Provider',
  kind: 'provider',
  description: 'Injected Ephemery Testnet Provider',
  methods: ['sendAsync', 'init', 'useFaucet'],
  version: packageJson.version,
}

export class InjectedEphemeryTestnetProvider extends InjectedCustomProvider {
  constructor() {
    super(profile, 
      'Ephemery Testnet',
      '',
      ['https://otter.bordel.wtf/erigon', 'https://eth.ephemeral.zeus.fyi'],
      {
        "name": "Ephemery ETH",
        "symbol": "ETH",
        "decimals": 18
      },
      [
        'https://otter.bordel.wtf/',
        'https://explorer.ephemery.dev/'
      ] 
    )
  }

  async init() {
    const chainId = await new Web3(this.rpcUrls[0]).eth.getChainId()
    this.chainId = `0x${chainId.toString(16)}`
    this.chainName = `Ephemery Testnet ${chainId}`
    console.log('ephemeral chainid', chainId, this.chainId)
    await super.init()
    return {}
  }

  async useFaucet(recipient: string, value: number) {
    try {
      await fetch('https://api-faucet.bordel.wtf/send-eth', {
        mode: 'cors',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_address: recipient, amount_eth: value }),
      })
      this.call('notification', 'toast', `Sending ${value} value to ${recipient}`)
    } catch (err) {
      this.call('notification', 'toast', `Unable to call the faucet api ${err.message}`)
    }
  }
}
