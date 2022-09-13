'use strict'

import { AstNode } from "@remix-project/remix-solidity-ts"
import { CodeParser } from "../code-parser"
import { antlr } from '../types'

const SolidityParser = (window as any).SolidityParser = (window as any).SolidityParser || []

export default class CodeParserAntlrService {
    plugin: CodeParser
    constructor(plugin: CodeParser) {
        this.plugin = plugin
    }

    /*
    * simple parsing is used to quickly parse the current file or a text source without using the compiler or having to resolve imports
    */

    async parseSolidity(text: string) {
        const ast: antlr.ParseResult = (SolidityParser as any).parse(text, { loc: true, range: true, tolerant: true })
        return ast
    }

    /**
     * Tries to parse the current file or the given text and returns the AST
     * If the parsing fails it returns the last successful AST for this file
     * @param text 
     * @returns 
     */
    async getCurrentFileAST(text: string | null = null) {
        this.plugin.currentFile = await this.plugin.call('fileManager', 'file')
        if (this.plugin.currentFile && this.plugin.currentFile.endsWith('.sol')) {
            if (!this.plugin.currentFile) return
            const fileContent = text || await this.plugin.call('fileManager', 'readFile', this.plugin.currentFile)
            try {
                const ast = (SolidityParser as any).parse(fileContent, { loc: true, range: true, tolerant: true })
                this.plugin.antlrParserResult = ast
            } catch (e) {
                // do nothing
            }
            return this.plugin.antlrParserResult
        }
    }

    /**
    * Lists the AST nodes from the current file parser
    * These nodes need to be changed to match the node types returned by the compiler
    * @returns 
    */
    async listAstNodes() {
        await this.getCurrentFileAST();
        const nodes: AstNode[] = [];
        (SolidityParser as any).visit(this.plugin.antlrParserResult, {
            StateVariableDeclaration: (node: antlr.StateVariableDeclaration) => {
                if (node.variables) {
                    for (const variable of node.variables) {
                        nodes.push({ ...variable, nodeType: 'VariableDeclaration', id: null, src: null })
                    }
                }
            },
            VariableDeclaration: (node: antlr.VariableDeclaration) => {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            UserDefinedTypeName: (node: antlr.UserDefinedTypeName) => {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            FunctionDefinition: (node: antlr.FunctionDefinition) => {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            ContractDefinition: (node: antlr.ContractDefinition) => {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            MemberAccess: function (node: antlr.MemberAccess) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            Identifier: function (node: antlr.Identifier) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            EventDefinition: function (node: antlr.EventDefinition) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            ModifierDefinition: function (node: antlr.ModifierDefinition) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            InvalidNode: function (node: antlr.InvalidNode) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            EnumDefinition: function (node: antlr.EnumDefinition) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            },
            StructDefinition: function (node: antlr.StructDefinition) {
                nodes.push({ ...node, nodeType: node.type, id: null, src: null })
            }

        })
        return nodes
    }


    /**
     * 
     * @param ast 
     * @returns 
     */
    async getLastNodeInLine(ast: string) {
        let lastNode: any
        const checkLastNode = (node: antlr.MemberAccess | antlr.Identifier) => {
            if (lastNode && lastNode.range && lastNode.range[1]) {
                if (node.range[1] > lastNode.range[1]) {
                    lastNode = node
                }
            } else {
                lastNode = node
            }
        }

        (SolidityParser as any).visit(ast, {
            MemberAccess: function (node: antlr.MemberAccess) {
                checkLastNode(node)
            },
            Identifier: function (node: antlr.Identifier) {
                checkLastNode(node)
            }
        })
        if (lastNode && lastNode.expression) {
            return lastNode.expression
        }
        return lastNode
    }
    /*
    * get the code blocks of the current file
    */
    async getCurrentFileBlocks(text: string | null = null) {
        this.plugin.currentFile = await this.plugin.call('fileManager', 'file')
        if (this.plugin.currentFile && this.plugin.currentFile.endsWith('.sol')) {
            if (!this.plugin.currentFile) return
            const fileContent = text || await this.plugin.call('fileManager', 'readFile', this.plugin.currentFile)
            try {
                const blocks = (SolidityParser as any).parseBlock(fileContent, { loc: true, range: true, tolerant: true })
                return blocks
            } catch (e) {
                // do nothing
            }
        }
    }

    /**
    * Returns the block surrounding the given position
    * For example if the position is in the middle of a function, it will return the function
    * @param {position} position
    * @param {string} text // optional
    * @return {any}
    * */
    async getANTLRBlockAtPosition(position: any, text: string = null) {
        const blocks = await this.getCurrentFileBlocks(text)
        const walkAst = (blocks) => {
            let nodeFound = null
            for(const object of blocks){
                if(object.start <= position && object.end >= position){
                    nodeFound = object
                    break
                }
            }
            return nodeFound
        }
        if (!blocks) return
        const block =  walkAst(blocks)
        console.log(block)
        return block
    }

}