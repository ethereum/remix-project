import React from 'react'
import { Plugin } from '@remixproject/engine'
import { customAction } from '@remixproject/plugin-api'
import { concatSourceFiles, getDependencyGraph } from '@remix-ui/solidity-compiler'

const profile = {
  name: 'contractflattener',
  displayName: 'Contract Flattener',
  description: 'Flatten solidity contracts',
  methods: ['flattenAContract'],
  events: [],
}

export class ContractFlattener extends Plugin {
  fileName: string
  constructor() {
    super(profile)
    this.fileName = ''
  }

  onActivation(): void {
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data, input, version) => {
      await this.flattenContract(source, this.fileName, data)
    })  
  }

  async flattenAContract(action: customAction) {
    this.fileName = action.path[0]
    await this.call('solidity', 'compile', this.fileName)
  }

  /**
   * Takes currently compiled contract that has a bunch of imports at the top
   * and flattens them ready for UML creation. Takes the flattened result
   * and assigns to a local property
   * @returns {Promise<string>}
   */
  async flattenContract (source: any, filePath: string, data: any) {
    const ast = data.sources
    const dependencyGraph = getDependencyGraph(ast, filePath)
    const sorted = dependencyGraph.isEmpty()
    ? [filePath]
    : dependencyGraph.sort().reverse()
    const sources = source.sources
    const result = concatSourceFiles(sorted, sources)
    await this.call('fileManager', 'writeFile', `${filePath}_flattened.sol`, result)
    return result
  }
}