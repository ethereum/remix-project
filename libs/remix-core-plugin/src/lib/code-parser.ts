'use strict'
import { Plugin } from '@remixproject/engine'
import { sourceMappingDecoder } from '@remix-project/remix-debug'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import { Compiler } from '@remix-project/remix-solidity'


import { CompilationError, CompilationResult, CompilationSource, helper } from '@remix-project/remix-solidity-ts'
const SolidityParser = (window as any).SolidityParser = (window as any).SolidityParser || []

const profile = {
    name: 'codeParser',
    methods: ['getBlockName', 'getLastNodeInLine', 'resolveImports', 'parseSolidity', 'getAST', 'nodesWithScope', 'nodesWithName', 'getNodes', 'compile', 'getNodeById', 'getLastCompilationResult', 'positionOfDefinition', 'definitionAtPosition', 'jumpToDefinition', 'referrencesAtPosition', 'nodesAtEditorPosition', 'referencesOf', 'getActiveHighlights', 'gasEstimation', 'declarationOf', 'jumpToPosition'],
    events: [],
    version: '0.0.1'
}

export class CodeParser extends Plugin {

    currentFileAST: any // contains the simple parsed AST for the current file
    compiler: any // used to compile the current file seperately from the main compiler
    onAstFinished: (success: any, data: any, source: any, input: any, version: any) => Promise<void>
    currentFile: any

    constructor() {
        super(profile)
    }

    async onActivation() {
        this.on('editor', 'contentChanged', async () => {
            console.log('contentChanged')
            await this.getCurrentFileAST()
            await this.compile()
        })

        this.on('fileManager', 'currentFileChanged', async () => {
            await this.getCurrentFileAST()
            await this.compile()
        })

        this.compiler = new Compiler((url, cb) => this.call('contentImport', 'resolveAndSave', url, undefined, false).then((result) => cb(null, result)).catch((error) => cb(error.message)))
    }

    // COMPILER

    async compile() {
        try {
            const state = await this.call('solidity', 'getCompilerState')
            this.compiler.set('optimize', state.optimize)
            this.compiler.set('evmVersion', state.evmVersion)
            this.compiler.set('language', state.language)
            this.compiler.set('runs', state.runs)
            this.compiler.set('useFileConfiguration', state.useFileConfiguration)
            this.currentFile = await this.call('fileManager', 'file')
            if (!this.currentFile) return
            const content = await this.call('fileManager', 'readFile', this.currentFile)
            const sources = { [this.currentFile]: { content } }
            this.compiler.compile(sources, this.currentFile)
        } catch (e) {
            console.log(e)
        }
    }

    /*
    * simple parsing is used to quickly parse the current file or a text source without using the compiler or having to resolve imports
    */

    async parseSolidity(text: string) {
        const ast = (SolidityParser as any).parse(text, { loc: true, range: true, tolerant: true })
        console.log('AST PARSE SUCCESS', ast)
        return ast
    }

    /**
     * Tries to parse the current file or the given text and returns the AST
     * If the parsing fails it returns the last successful AST for this file
     * @param text 
     * @returns 
     */
    async getCurrentFileAST(text: string = null) {
        this.currentFile = await this.call('fileManager', 'file')
        if (!this.currentFile) return
        const fileContent = text || await this.call('fileManager', 'readFile', this.currentFile)
        try {
            const ast = await this.parseSolidity(fileContent)
            this.currentFileAST = ast
            console.log('AST PARSE SUCCESS', ast)
        } catch (e) {
            console.log(e)
        }
        console.log('LAST PARSER AST', this.currentFileAST)
        return this.currentFileAST
    }

    /**
    * Returns the block surrounding the given position
    * For example if the position is in the middle of a function, it will return the function
    * @param {position} position
    * @param {string} text // optional
    * @return {any}
    * */
    async getBlockAtPosition(position: any, text: string = null) {
        await this.getCurrentFileAST(text)
        const allowedTypes = ['SourceUnit', 'ContractDefinition', 'FunctionDefinition']

        const walkAst = (node) => {
            console.log(node)
            if (node.loc.start.line <= position.lineNumber && node.loc.end.line >= position.lineNumber) {
                const children = node.children || node.subNodes
                if (children && allowedTypes.indexOf(node.type) !== -1) {
                    for (const child of children) {
                        const result = walkAst(child)
                        if (result) return result
                    }
                }
                return node
            }
            return null
        }
        if (!this.currentFileAST) return
        return walkAst(this.currentFileAST)
    }


}