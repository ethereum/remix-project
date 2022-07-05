'use strict'

import { CodeParser } from "../code-parser"

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
        const t0 = performance.now();
        const ast = (SolidityParser as any).parse(text, { loc: true, range: true, tolerant: true })
        const t1 = performance.now();
        console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
        console.log('AST PARSE SUCCESS', ast)
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
        if (!this.plugin.currentFile) return
        const fileContent = text || await this.plugin.call('fileManager', 'readFile', this.plugin.currentFile)
        try {
            const ast = await this.parseSolidity(fileContent)
            this.plugin.currentFileAST = ast
        } catch (e) {
            console.log(e)
        }
        return this.plugin.currentFileAST
    }

    /**
    * Lists the AST nodes from the current file parser
    * These nodes need to be changed to match the node types returned by the compiler
    * @returns 
    */
    async listAstNodes() {
        await this.getCurrentFileAST();
        const nodes: any = [];
        (SolidityParser as any).visit(this.plugin.currentFileAST, {
            StateVariableDeclaration: (node) => {
                if (node.variables) {
                    for (const variable of node.variables) {
                        nodes.push({ ...variable, nodeType: 'VariableDeclaration' })
                    }
                }
            },
            VariableDeclaration: (node) => {
                nodes.push({ ...node, nodeType: node.type })
            },
            UserDefinedTypeName: (node) => {
                nodes.push({ ...node, nodeType: node.type })
            },
            FunctionDefinition: (node) => {
                nodes.push({ ...node, nodeType: node.type })
            },
            ContractDefinition: (node) => {
                nodes.push({ ...node, nodeType: node.type })
            },
            MemberAccess: function (node) {
                nodes.push({ ...node, nodeType: node.type })
            },
            Identifier: function (node) {
                nodes.push({ ...node, nodeType: node.type })
            },
            EventDefinition: function (node) {
                nodes.push({ ...node, nodeType: node.type })
            },
            ModifierDefinition: function (node) {
                nodes.push({ ...node, nodeType: node.type })
            },
            InvalidNode: function (node) {
                nodes.push({ ...node, nodeType: node.type })
            }
        })
        console.log("LIST NODES", nodes)
        return nodes
    }


    /**
     * 
     * @param ast 
     * @returns 
     */
    async getLastNodeInLine(ast: string) {
        let lastNode
        const checkLastNode = (node) => {
            if (lastNode && lastNode.range && lastNode.range[1]) {
                if (node.range[1] > lastNode.range[1]) {
                    lastNode = node
                }
            } else {
                lastNode = node
            }
        }

        (SolidityParser as any).visit(ast, {
            MemberAccess: function (node) {
                checkLastNode(node)
            },
            Identifier: function (node) {
                checkLastNode(node)
            }
        })
        if (lastNode && lastNode.expression && lastNode.expression.expression) {
            console.log('lastNode with expression', lastNode, lastNode.expression)
            return lastNode.expression.expression
        }
        if (lastNode && lastNode.expression) {
            console.log('lastNode with expression', lastNode, lastNode.expression)
            return lastNode.expression
        }
        console.log('lastNode', lastNode)
        return lastNode
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
        if (!this.plugin.currentFileAST) return
        return walkAst(this.plugin.currentFileAST)
    }

}