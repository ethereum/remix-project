import * as packageJson from '../../../../../package.json'
import { InjectedProvider } from './injected-provider'

const profile = {
  name: 'injected',
  displayName: 'Injected Provider',
  kind: 'provider',
  description: 'injected Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class BasicInjectedProvider extends InjectedProvider {    

  constructor () {
    super(profile)
  }
}