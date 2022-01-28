import { Plugin } from '@remixproject/engine'
import QueryParams from '../../lib/query-params'

const profile = {
  name: 'config',
  displayName: 'Config',
  description: 'Config',
  methods: ['getAppParameter', 'setAppParameter']
}
declare var Registry
export class ConfigPlugin extends Plugin {
  constructor () {
    super(profile)
  }

  getAppParameter (name: string) {
    const queryParams = new QueryParams()
    const params = queryParams.get()
    const config = Registry.get('config').api
    const param = params[name] ? params[name] : config.get(name)
    if (param === 'true') return true
    if (param === 'false') return false
    return param
  }

  setAppParameter (name: string, value: any) {
    const config = Registry.get('config').api
    config.set(name, value)
  }
}
