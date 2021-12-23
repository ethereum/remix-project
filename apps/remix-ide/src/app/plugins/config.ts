import { Plugin } from '@remixproject/engine'
import QueryParams from '../../lib/query-params'
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
    const param = params[name] ? params[name] : config.get(name)
    if (param === 'true') return true
    if (param === 'false') return false
    console.log(param)
    return param
  }

  setAppParameter (name: string, value: any) {
    console.log('setAppParameter', name, value)
    const config = Registry.getInstance().get('config').api
    config.set(name, value)
  }
}
