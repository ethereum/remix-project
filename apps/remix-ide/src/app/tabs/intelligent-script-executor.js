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
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data, input, version) => {
      const currentFile = await this.call('fileManager', 'file') 
      if (data && data.sources[currentFile] &&
        data.sources[currentFile].ast && data.sources[currentFile].ast.nodes && data.sources[currentFile].ast.nodes.length) {
          const nodes = data.sources[currentFile].ast.nodes
          for (let node of nodes) {
            if (node.documentation && node.documentation.text && node.documentation.text.startsWith('@custom:dev-run-script')) {
              const text = node.documentation.text.replace('@custom:dev-run-script', '').trim()
              await this.call('terminal', 'log', `running ${text} ...`)
              const content = await this.call('fileManager', 'readFile', text)
              await this.call('udapp', 'clearAllInstances')
              await this.call('scriptRunner', 'execute', content)
            }
          }
      }      
    })
  }

  onDeactivation () {
    this.off('solidity', 'compilationFinished')
  }
}
