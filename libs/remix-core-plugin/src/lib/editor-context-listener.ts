'use strict'
import { Plugin } from '@remixproject/engine'

import { sourceMappingDecoder } from '@remix-project/remix-debug'

const profile = {
  name: 'contextualListener',
  methods: ['referencesOf', 'getActiveHighlights', 'gasEstimation', 'declarationOf'],
  events: [],
  version: '0.0.1'
}

/*
  trigger contextChanged(nodes)
*/
export class EditorContextListener extends Plugin {
  _index: any
  _activeHighlights: Array<any>
  astWalker: any
  currentPosition: any
  currentFile: string
  nodes: Array<any>
  results: any
  estimationObj: any
  creationCost: any
  codeDepositCost: any
  contract: any
  activated: boolean

  constructor (astWalker) {
    super(profile)
    this.activated = false
    this._index = {
      Declarations: {},
      FlatReferences: {}
    }
    this._activeHighlights = []

    this.astWalker = astWalker
  }

  onActivation () {
    this.on('editor', 'contentChanged', () => { this._stopHighlighting() })

    this.on('solidity', 'compilationFinished', (file, source, languageVersion, data, input, version) => {
      if (languageVersion.indexOf('soljson') !== 0) return
      this._stopHighlighting()
      this._index = {
        Declarations: {},
        FlatReferences: {}
      }
      this._buildIndex(data, source)
    })

    setInterval(async () => {
      const compilationResult = await this.call('compilerArtefacts', 'getLastCompilationResult')
      if (compilationResult && compilationResult.languageversion.indexOf('soljson') === 0) {
        let currentFile
        try {
          currentFile = await this.call('fileManager', 'file')
        } catch (error) {
          if (error.message !== 'Error: No such file or directory No file selected') throw error
        }
        this._highlightItems(
          await this.call('editor', 'getCursorPosition'),
          compilationResult,
          currentFile
        )
      }
    }, 1000)

    this.activated = true
  }

  getActiveHighlights () {
    return [...this._activeHighlights]
  }

  declarationOf (node) {
    if (node && node.referencedDeclaration) {
      return this._index.FlatReferences[node.referencedDeclaration]
    }
    return null
  }

  referencesOf (node) {
    return this._index.Declarations[node.id]
  }

  async _highlightItems (cursorPosition, compilationResult, file) {
    if (this.currentPosition === cursorPosition) return
    this._stopHighlighting()
    this.currentPosition = cursorPosition
    this.currentFile = file
    if (compilationResult && compilationResult.data && compilationResult.data.sources[file]) {
      const nodes = sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[file])
      this.nodes = nodes
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        await this._highlightExpressions(nodes[nodes.length - 1], compilationResult)
      }
      this.emit('contextChanged', nodes)
    }
  }

  _buildIndex (compilationResult, source) {
    if (compilationResult && compilationResult.sources) {
      const callback = (node) => {
        if (node && node.referencedDeclaration) {
          if (!this._index.Declarations[node.referencedDeclaration]) {
            this._index.Declarations[node.referencedDeclaration] = []
          }
          this._index.Declarations[node.referencedDeclaration].push(node)
        }
        this._index.FlatReferences[node.id] = node
      }
      for (const s in compilationResult.sources) {
        this.astWalker.walkFull(compilationResult.sources[s].ast, callback)
      }
    }
  }

  async _highlight (node, compilationResult) {
    if (!node) return
    const position = sourceMappingDecoder.decode(node.src)
    const fileTarget = compilationResult.getSourceName(position.file)
    const nodeFound = this._activeHighlights.find((el) => el.fileTarget === fileTarget && el.position.file === position.file && el.position.length === position.length && el.position.start === position.start)
    if (nodeFound) return // if the content is already highlighted, do nothing.

    await this._highlightInternal(position, node, compilationResult)
    if (compilationResult && compilationResult.languageversion.indexOf('soljson') === 0) {
      this._activeHighlights.push({ position, fileTarget, nodeId: node.id })
    }
  }

  async _highlightInternal (position, node, compilationResult) {
    if (node.nodeType === 'Block') return
    if (compilationResult && compilationResult.languageversion.indexOf('soljson') === 0) {
      let lineColumn = await this.call('offsetToLineColumnConverter', 'offsetToLineColumn', position, position.file, compilationResult.getSourceCode().sources, compilationResult.getAsts())
      if (node.nodes && node.nodes.length) {
        // If node has children, highlight the entire line. if not, just highlight the current source position of the node.
        lineColumn = {
          start: {
            line: lineColumn.start.line,
            column: 0
          },
          end: {
            line: lineColumn.start.line + 1,
            column: 0
          }
        }
      }
      const fileName = compilationResult.getSourceName(position.file)
      if (fileName) {
        return await this.call('editor', 'highlight', lineColumn, fileName, '', { focus: false })
      }
    }
    return null
  }

  async _highlightExpressions (node, compilationResult) {
    const highlights = async (id) => {
      if (this._index.Declarations && this._index.Declarations[id]) {
        const refs = this._index.Declarations[id]
        for (const ref in refs) {
          const node = refs[ref]
          await this._highlight(node, compilationResult)
        }
      }
    }
    if (node && node.referencedDeclaration) {
      await highlights(node.referencedDeclaration)
      const current = this._index.FlatReferences[node.referencedDeclaration]
      await this._highlight(current, compilationResult)
    } else {
      await highlights(node.id)
      await this._highlight(node, compilationResult)
    }
    this.results = compilationResult
  }

  _stopHighlighting () {
    this.call('editor', 'discardHighlight')
    this.emit('stopHighlighting')
    this._activeHighlights = []
  }

  gasEstimation (node) {
    this._loadContractInfos(node)
    let executionCost, codeDepositCost
    if (node.nodeType === 'FunctionDefinition') {
      const visibility = node.visibility
      if (node.kind !== 'constructor') {
        const fnName = node.name
        const fn = fnName + this._getInputParams(node)
        if (visibility === 'public' || visibility === 'external') {
          executionCost = this.estimationObj === null ? '-' : this.estimationObj.external[fn]
        } else if (visibility === 'private' || visibility === 'internal') {
          executionCost = this.estimationObj === null ? '-' : this.estimationObj.internal[fn]
        }
      } else {
        executionCost = this.creationCost
        codeDepositCost = this.codeDepositCost
      }
    } else {
      executionCost = '-'
    }
    return { executionCost, codeDepositCost }
  }

  _loadContractInfos (node) {
    const path = (this.nodes.length && this.nodes[0].absolutePath) || this.results.source.target
    for (const i in this.nodes) {
      if (this.nodes[i].id === node.scope) {
        const contract = this.nodes[i]
        this.contract = this.results.data.contracts[path][contract.name]
        if (contract) {
          this.estimationObj = this.contract.evm.gasEstimates
          this.creationCost = this.estimationObj === null ? '-' : this.estimationObj.creation.totalCost
          this.codeDepositCost = this.estimationObj === null ? '-' : this.estimationObj.creation.codeDepositCost
        }
      }
    }
  }

  _getInputParams (node) {
    const params = []
    const target = node.parameters
    // for (const i in node.children) {
    //   if (node.children[i].name === 'ParameterList') {
    //     target = node.children[i]
    //     break
    //   }
    // }
    if (target) {
      const children = target.parameters
      for (const j in children) {
        if (children[j].nodeType === 'VariableDeclaration') {
          params.push(children[j].typeDescriptions.typeString)
        }
      }
    }
    return '(' + params.toString() + ')'
  }
}
