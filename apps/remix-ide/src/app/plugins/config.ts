import { Plugin } from '@remixproject/engine'
import { QueryParams } from '@remix-project/remix-lib'
import Registry from '../state/registry'

const profile = {
  name: 'config',
  displayName: 'Config',
  description: 'Config',
  methods: ['getAppParameter', 'setAppParameter']
}

export class ConfigPlugin extends Plugin {
  constructor () {
    super(profile)
  }

  getAppParameter (name: string) {
    const queryParams = new QueryParams()
    const params = queryParams.get()
    const config = Registry.getInstance().get('config').api
    const param = params[name] || config.get(name) || config.get('settings/' + name)
    if (param === 'true') return true
    if (param === 'false') return false
    return param
  }

  setAppParameter (name: string, value: any) {
    const config = Registry.getInstance().get('config').api
    config.set(name, value)
  }
}
