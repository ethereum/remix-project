'use strict'
import { Plugin } from '@remixproject/engine'
import { sourceMappingDecoder } from '@remix-project/remix-debug'

const profile = {
  name: 'contextualListener',
  methods: ['getActiveHighlights', 'gasEstimation', 'jumpToPosition', 'jumpToDefinition'],
  events: [],
  version: '0.0.1'
}

/*
  trigger contextChanged(nodes)
*/
export class EditorContextListener extends Plugin {
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

  constructor(astWalker) {
    super(profile)
    this.activated = false

    this._activeHighlights = []

    this.astWalker = astWalker
  }

  async onActivation() {
    return
    this.on('editor', 'contentChanged', async () => {
      console.log('contentChanged')
      this._stopHighlighting()
    })

    this.on('fileManager', 'currentFileChanged', async () => {
      this._stopHighlighting()
    })

    setInterval(async () => {
      console.log('interval')
      const compilationResult = await this.call('codeParser', 'getLastCompilationResult')
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

  getActiveHighlights() {
    return [...this._activeHighlights]
  }

  async jumpToDefinition(position: any) {
    const node = await this.call('codeParser', 'definitionAtPosition', position)
    const sourcePosition = await this.call('codeParser', 'positionOfDefinition', node)
    console.log("JUMP", sourcePosition)
    if (sourcePosition) {
      await this.jumpToPosition(sourcePosition)
    }
  }



  /*
  * onClick jump to position of ast node in the editor
  */
  async jumpToPosition(position: any) {
    const jumpToLine = async (fileName: string, lineColumn: any) => {
      if (fileName !== await this.call('fileManager', 'file')) {
        console.log('jump to file', fileName)
        await this.call('contentImport', 'resolveAndSave', fileName, null, true)
        await this.call('fileManager', 'open', fileName)
      }
      if (lineColumn.start && lineColumn.start.line >= 0 && lineColumn.start.column >= 0) {
        this.call('editor', 'gotoLine', lineColumn.start.line, lineColumn.end.column + 1)
      }
    }
    const lastCompilationResult = await this.call('codeParser', 'getLastCompilationResult')  // await this.call('compilerArtefacts', 'getLastCompilationResult')
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
    const urlFromPath = await this.call('fileManager', 'getUrlFromPath', this.currentFile)
    if (compilationResult && compilationResult.data && (compilationResult.data.sources[file] || compilationResult.data.sources[urlFromPath.file])) {
      const nodes = sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[file] || compilationResult.data.sources[urlFromPath.file])
      this.nodes = nodes
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        await this._highlightExpressions(nodes[nodes.length - 1], compilationResult)
      }
      this.emit('contextChanged', nodes)
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
      const refs = await this.call('codeParser', 'getDeclaration', id)
      if (refs) {
        for (const ref in refs) {
          const node = refs[ref]
          await this._highlight(node, compilationResult)
        }
      }
    }
    if (node && node.referencedDeclaration) {
      await highlights(node.referencedDeclaration)
      const current = await this.call('codeParser', 'getNodeById', node.referencedDeclaration) // this._index.FlatReferences[node.referencedDeclaration]
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
    console.log(this.results)
    const path = (this.nodes.length && this.nodes[0].absolutePath) || this.results.source.target
    for (const i in this.nodes) {
      if (this.nodes[i].id === node.scope) {
        const contract = this.nodes[i]
        this.contract = this.results.data.contracts && this.results.data.contracts[path] && this.results.data.contracts[path][contract.name]
        if (this.contract) {
          this.estimationObj = this.contract.evm && this.contract.evm.gasEstimates
          if (this.estimationObj) {
            this.creationCost = this.estimationObj === null ? '-' : this.estimationObj.creation.totalCost
            this.codeDepositCost = this.estimationObj === null ? '-' : this.estimationObj.creation.codeDepositCost
          }
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
