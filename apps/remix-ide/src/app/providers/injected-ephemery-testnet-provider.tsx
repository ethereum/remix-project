import * as packageJson from '../../../../../package.json'
import { InjectedCustomProvider } from './injected-custom-provider'

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
    super(profile, 'Ephemery Testnet', '0x259C709', ['https://otter.bordel.wtf/erigon', 'https://eth.ephemeral.zeus.fyi'])
  }

  async useFaucet(recipient: string, value: number) {
    try {
      await fetch('https://api-faucet.bordel.wtf/send-eth', {
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
