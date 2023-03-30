import React from 'react'
import { Plugin } from '@remixproject/engine'
import { customAction } from '@remixproject/plugin-api'
import { concatSourceFiles, getDependencyGraph, normalizeContractPath } from '@remix-ui/solidity-compiler'

const _paq = window._paq = window._paq || []

const profile = {
  name: 'contractflattener',
  displayName: 'Contract Flattener',
  description: 'Flatten solidity contracts',
  methods: ['flattenAContract', 'flattenContract'],
  events: [],
  maintainedBy: 'Remix',
}

export class ContractFlattener extends Plugin {
  constructor() {
    super(profile)
  }

  onActivation(): void {
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data, input, version) => {
      if(data.sources && Object.keys(data.sources).length > 1) {
        await this.flattenContract(source, file, data)
      }
    })  
    _paq.push(['trackEvent', 'plugin', 'activated', 'contractFlattener'])
  }

  async flattenAContract(action: customAction) {
    await this.call('solidity', 'compile', action.path[0])
  }

  /**
   * Takes currently compiled contract that has a bunch of imports at the top
   * and flattens them ready, ideally for UML creation or for other purposes.
   * Takes the flattened result, writes it to a file and returns the result.
   * @returns {Promise<string>}
   */
  async flattenContract (source: { sources: any, target: string },
    filePath: string, data: { contracts: any, sources: any }): Promise<string> {
    const path = normalizeContractPath(filePath)
    const ast = data.sources
    let dependencyGraph
    let sorted
    let result
    let sources
    try{
      dependencyGraph = getDependencyGraph(ast, filePath)
      sorted = dependencyGraph.isEmpty()
      ? [filePath]
      : dependencyGraph.sort().reverse()
      sources = source.sources
      result = concatSourceFiles(sorted, sources)
    }catch(err){
      console.warn(err)
    }
    await this.call('fileManager', 'writeFile', path , result)
    _paq.push(['trackEvent', 'plugin', 'contractFlattener', 'flattenAContract'])
    sorted = null
    sources = null
    dependencyGraph = null
    return result
  }
}