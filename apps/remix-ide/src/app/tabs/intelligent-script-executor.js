import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'

export const profile = {
  name: 'intelligentScriptExecutor',
  displayName: 'Intelligent Script Executor',
  description: 'after each compilation, run the script defined in Natspec.',
  methods: [],
  version: packageJson.version,
  kind: 'none'
}

export class IntelligentScriptExecutor extends Plugin {
  constructor () {
    super(profile)    
  }

  onActivation () {
    let listen = false
    setTimeout(() => {
      listen = true
    }, 500)
    this.on('compilerMetadata', 'artefactsUpdated', async (fileName, contract) => {
      if (!listen) return
      if (contract.object && contract.object.devdoc['custom:dev-run-script']) {
        const text = contract.object.devdoc['custom:dev-run-script']
        await this.call('terminal', 'log', `running ${text} ...`)
        const content = await this.call('fileManager', 'readFile', text)
        await this.call('udapp', 'clearAllInstances')
        await this.call('scriptRunner', 'execute', content)
      }      
    })
  }

  onDeactivation () {
    this.off('solidity', 'compilationFinished')
  }
}
