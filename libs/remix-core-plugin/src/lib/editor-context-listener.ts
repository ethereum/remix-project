'use strict'
import { Plugin } from '@remixproject/engine'

import { sourceMappingDecoder } from '@remix-project/remix-debug'
import { compile } from '@remix-project/remix-solidity'
import { canUseWorker, Compiler, CompilerAbstract, urlFromVersion } from '@remix-project/remix-solidity-ts'

const profile = {
  name: 'contextualListener',
  methods: ['nodesWithScope', 'getNodes', 'compile', 'getNodeById', 'getLastCompilationResult', 'positionOfDefinition', 'definitionAtPosition', 'jumpToDefinition', 'referrencesAtPosition', 'nodesAtEditorPosition', 'referencesOf', 'getActiveHighlights', 'gasEstimation', 'declarationOf', 'jumpToPosition'],
  events: [],
  version: '0.0.1'
}

export function isDefinition(node: any) {
  return node.nodeType === 'ContractDefinition' ||
    node.nodeType === 'FunctionDefinition' ||
    node.nodeType === 'ModifierDefinition' ||
    node.nodeType === 'VariableDeclaration' ||
    node.nodeType === 'StructDefinition' ||
    node.nodeType === 'EventDefinition'
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

  compiler: Compiler
  lastCompilationResult: any

  constructor(astWalker) {
    super(profile)
    this.activated = false
    this._index = {
      Declarations: {},
      FlatReferences: {}
    }
    this._activeHighlights = []

    this.astWalker = astWalker
  }

  onActivation() {
    this.on('editor', 'contentChanged', () => { this._stopHighlighting() })

    this.on('solidity', 'astFinished', async (file, source, languageVersion, data, input, version) => {
      // console.log('compilation result', Object.keys(data.sources))
      if (languageVersion.indexOf('soljson') !== 0 || !data.sources) return
      if (data.sources && Object.keys(data.sources).length === 0) return
      this.lastCompilationResult = new CompilerAbstract(languageVersion, data, source, input)

      this._stopHighlighting()
      this._index = {
        Declarations: {},
        FlatReferences: {}
      }
      this._buildIndex(data, source)
      this.emit('astFinished')
    })

    setInterval(async () => {

      const compilationResult = this.lastCompilationResult // await this.call('compilerArtefacts', 'getLastCompilationResult')
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
  }

  async getLastCompilationResult() {
    return this.lastCompilationResult
  }

  async compile() {
    this.currentFile = await this.call('fileManager', 'file')
    return await this.call('solidity', 'compile', this.currentFile)
  }

  getActiveHighlights() {
    return [...this._activeHighlights]
  }

  declarationOf(node) {
    if (node && node.referencedDeclaration) {
      return this._index.FlatReferences[node.referencedDeclaration]
    } else {
      // console.log(this._index.FlatReferences)
    }
    return null
  }

  referencesOf(node: any) {
    const results = []
    const highlights = (id) => {
      if (this._index.Declarations && this._index.Declarations[id]) {
        const refs = this._index.Declarations[id]
        for (const ref in refs) {
          const node = refs[ref]
          results.push(node)
        }
      }
    }
    if (node && node.referencedDeclaration) {
      highlights(node.referencedDeclaration)
      const current = this._index.FlatReferences[node.referencedDeclaration]
      results.push(current)
    } else {
      highlights(node.id)
    }
    return results
  }

  async nodesAtEditorPosition(position: any, type: string = '') {
    const lastCompilationResult = this.lastCompilationResult // await this.call('compilerArtefacts', 'getLastCompilationResult')
    if (!lastCompilationResult) return false
    let urlFromPath = await this.call('fileManager', 'getUrlFromPath', this.currentFile)
    if (lastCompilationResult && lastCompilationResult.languageversion.indexOf('soljson') === 0 && lastCompilationResult.data) {
      const nodes = sourceMappingDecoder.nodesAtPosition(type, position, lastCompilationResult.data.sources[this.currentFile] || lastCompilationResult.data.sources[urlFromPath.file])
      return nodes
    }
    return []
  }

  async referrencesAtPosition(position: any) {
    const nodes = await this.nodesAtEditorPosition(position)
    if (nodes && nodes.length) {
      const node = nodes[nodes.length - 1]
      if (node) {
        return this.referencesOf(node)
      }
    }
  }

  async getNodeById(id: any) {
    for (const key in this._index.FlatReferences) {
      if (this._index.FlatReferences[key].id === id) {
        return this._index.FlatReferences[key]
      }
    }
  }

  async nodesWithScope(scope: any) {
    const nodes = []
    for(const node of Object.values(this._index.FlatReferences) as any[]){
      if(node.scope === scope) nodes.push(node)
    }
    return nodes
  }
  
  async definitionAtPosition(position: any) {
    const nodes = await this.nodesAtEditorPosition(position)
    console.log('nodes at position', nodes)
    console.log(this._index.FlatReferences)
    let nodeDefinition: any
    let node: any
    if (nodes && nodes.length) {
      node = nodes[nodes.length - 1]
      nodeDefinition = node
      if (!isDefinition(node)) {
        nodeDefinition = await this.declarationOf(node) || node
      }
      if (node.nodeType === 'ImportDirective') {
        for (const key in this._index.FlatReferences) {
          if (this._index.FlatReferences[key].id === node.sourceUnit) {
            nodeDefinition = this._index.FlatReferences[key]
          }
        }
      }
      return nodeDefinition
    } else {
      return false
    }

  }

  async positionOfDefinition(node: any) {
    if (node) {
      if (node.src) {
        const position = sourceMappingDecoder.decode(node.src)
        if (position) {
          return position
        }
      }
    }
    return null
  }

  async jumpToDefinition(position: any) {
    const node = await this.definitionAtPosition(position)
    const sourcePosition = await this.positionOfDefinition(node)
    if (sourcePosition) {
      await this.jumpToPosition(sourcePosition)
    }
  }

  async getNodes() {
    return this._index.FlatReferences
  }

  /*
  * onClick jump to position of ast node in the editor
  */
  async jumpToPosition(position: any) {
    const jumpToLine = async (fileName: string, lineColumn: any) => {
      if (fileName !== await this.call('fileManager', 'file')) {
        console.log('jump to file', fileName)
        await this.call('fileManager', 'open', fileName)
      }
      if (lineColumn.start && lineColumn.start.line >= 0 && lineColumn.start.column >= 0) {
        this.call('editor', 'gotoLine', lineColumn.start.line, lineColumn.end.column + 1)
      }
    }
    const lastCompilationResult = this.lastCompilationResult // await this.call('compilerArtefacts', 'getLastCompilationResult')
    console.log(lastCompilationResult.getSourceCode().sources)
    console.log(position)
    if (lastCompilationResult && lastCompilationResult.languageversion.indexOf('soljson') === 0 && lastCompilationResult.data) {
      const lineColumn = await this.call('offsetToLineColumnConverter', 'offsetToLineColumn',
        position,
        position.file,
        lastCompilationResult.getSourceCode().sources,
        lastCompilationResult.getAsts())
      const filename = lastCompilationResult.getSourceName(position.file)
      // TODO: refactor with rendererAPI.errorClick
      console.log(filename, lineColumn)
      jumpToLine(filename, lineColumn)
    }
  }

  async _highlightItems(cursorPosition, compilationResult, file) {
    if (this.currentPosition === cursorPosition) return
    this._stopHighlighting()
    this.currentPosition = cursorPosition
    this.currentFile = file
    let urlFromPath = await this.call('fileManager', 'getUrlFromPath', this.currentFile)
    if (compilationResult && compilationResult.data && (compilationResult.data.sources[file] || compilationResult.data.sources[urlFromPath.file])) {
      const nodes = sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[file] || compilationResult.data.sources[urlFromPath.file])
      this.nodes = nodes
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        await this._highlightExpressions(nodes[nodes.length - 1], compilationResult)
      }
      this.emit('contextChanged', nodes)
    }
  }

  _buildIndex(compilationResult, source) {
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

  async _highlight(node, compilationResult) {
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

  async _highlightInternal(position, node, compilationResult) {
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

  async _highlightExpressions(node, compilationResult) {
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

  _stopHighlighting() {
    this.call('editor', 'discardHighlight')
    this.emit('stopHighlighting')
    this._activeHighlights = []
  }

  gasEstimation(node) {
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

  _loadContractInfos(node) {
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



  _getInputParams(node) {
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
