import { sourceMappingDecoder } from "@remix-project/remix-debug"
import { AstNode } from "@remix-project/remix-solidity-ts"
import { isArray } from "lodash"
import { editor, languages, Position } from "monaco-editor"
import monaco from "../../types/monaco"
import { EditorUIProps } from "../remix-ui-editor"
import { GeCompletionUnits, GetCompletionKeywords, getCompletionSnippets, GetCompletionTypes, getContextualAutoCompleteByGlobalVariable, GetGlobalFunctions, GetGlobalVariable } from "./completion/completionGlobals"

export class RemixCompletionProvider implements languages.CompletionItemProvider {

    props: EditorUIProps
    monaco: any

    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    triggerCharacters = ['.', '']
    async provideCompletionItems(model: editor.ITextModel, position: Position, context: monaco.languages.CompletionContext): Promise<monaco.languages.CompletionList | undefined> {
        console.log('AUTOCOMPLETE', context)

        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        const line = model.getLineContent(position.lineNumber)
        let nodes: AstNode[] = []
        let suggestions: monaco.languages.CompletionItem[] = []



        if (context.triggerCharacter === '.') {
            console.clear()
            const lineTextBeforeCursor: string = line.substring(0, position.column - 1)
            const lastNodeInExpression = await this.getLastNodeInExpression(lineTextBeforeCursor)
            console.log('lastNode found', lastNodeInExpression)
            const expressionElements = lineTextBeforeCursor.split('.')

            let dotCompleted = false

            // handles completion from for builtin types
            const globalCompletion = getContextualAutoCompleteByGlobalVariable(lastNodeInExpression.name, range, this.monaco)
            if (globalCompletion) {
                dotCompleted = true
                suggestions = [...suggestions, ...globalCompletion]
                setTimeout(() => {
                    // eslint-disable-next-line no-debugger
                    // debugger
                }, 2000)
            }
            // handle completion for global THIS.
            if (lastNodeInExpression.name === 'this') {
                dotCompleted = true
                nodes = [...nodes, ...await this.getThisCompletions(position)]
            }
            // handle completion for other dot completions
            if (expressionElements.length > 1 && !dotCompleted) {

                const nameOfLastTypedExpression = lastNodeInExpression.name || lastNodeInExpression.memberName
                nodes = [...nodes, ...await this.getDotCompletions(position, nameOfLastTypedExpression)]
                
            }
        } else {

            // handles contract completions and other suggestions
            suggestions = [...suggestions,
            ...GetGlobalVariable(range, this.monaco),
            ...getCompletionSnippets(range, this.monaco),
            ...GetCompletionTypes(range, this.monaco),
            ...GetCompletionKeywords(range, this.monaco),
            ...GetGlobalFunctions(range, this.monaco),
            ...GeCompletionUnits(range, this.monaco),
            ]
            let contractCompletions = await this.getContractCompletions(position)

            // we can't have external nodes without using this.
            contractCompletions = contractCompletions.filter(node => {
                if (node.visibility && node.visibility === 'external') {
                    return false
                }
                return true
            })
            nodes = [...nodes, ...contractCompletions]

        }
        console.log('NODES', nodes)

        // remove duplicates
        const nodeIds = {};
        const filteredNodes = nodes.filter((node) => {
            if (node.id) {
                if (nodeIds[node.id]) {
                    return false;
                }
                nodeIds[node.id] = true;
            }
            return true;
        });

        const getNodeLink = async (node: any) => {
            return await this.props.plugin.call('codeParser', 'getNodeLink', node)
        }

        const getDocs = async (node: any) => {
            return await this.props.plugin.call('codeParser', 'getNodeDocumentation', node)
        }

        const getParamaters = async (node: any) => {
            return await this.props.plugin.call('codeParser', 'getFunctionParamaters', node)
        }

        const completeParameters = async (parameters: any) => {
            const localParam = (parameters && parameters.parameters) || (parameters)
            if (localParam) {
                const params = []
                for (const key in localParam) {
                    params.push('${' + (key + 1) + ':' + localParam[key].name + '}')
                }
                return `(${params.join(', ')})`
            }
        }

        const getVariableDeclaration = async (node: any) => {
            let variableDeclaration = await this.props.plugin.call('codeParser', 'getVariableDeclaration', node)
            if (node.scope) {
                const scopeNode = await this.props.plugin.call('codeParser', 'getNodeById', node.scope)
                if (scopeNode) {
                    variableDeclaration = `${scopeNode.name}.${variableDeclaration}`
                }
            }
            return variableDeclaration
        }


        for (const node of Object.values(filteredNodes) as any[]) {
            if (!node.name) continue
            if (node.nodeType === 'VariableDeclaration') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` ${await getVariableDeclaration(node)}` },
                    kind: this.monaco.languages.CompletionItemKind.Variable,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if (node.nodeType === 'FunctionDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` -> ${node.name} ${await getParamaters(node)}` },
                    kind: this.monaco.languages.CompletionItemKind.Function,
                    insertText: `${node.name}${await completeParameters(node.parameters)};`,
                    insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'ContractDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Interface,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'StructDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Struct,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'EnumDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Enum,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'EventDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` -> ${node.name} ${await getParamaters(node)}` },
                    kind: this.monaco.languages.CompletionItemKind.Event,
                    insertText: `${node.name}${await completeParameters(node.parameters)};`,
                    insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'ModifierDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Method,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'EnumValue' || node.type === 'EnumValue') {
                const completion = {
                    label: { label: `"${node.name}"` },
                    kind: this.monaco.languages.CompletionItemKind.EnumMember,
                    insertText: node.name,
                    range: range,
                    documentation: null
                }
                suggestions.push(completion)

            } else {
                console.log('UNKNOWN NODE', node)
            }
        }

        console.log(suggestions)
        return {
            suggestions
        }
    }

    private getBlockNodesAtPosition = async (position: Position) => {
        let nodes: any[] = []
        const cursorPosition = this.props.editorAPI.getCursorPosition()
        const nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', cursorPosition)
        // try to get the block from ANTLR of which the position is in
        const ANTLRBlock = await this.props.plugin.call('codeParser', 'getANTLRBlockAtPosition', position, null)
        // if the block has a name and a type we can maybe find it in the contract nodes
        const fileNodes = await this.props.plugin.call('codeParser', 'getCurrentFileNodes')

        console.log('file nodes', fileNodes);

        if (isArray(nodesAtPosition) && nodesAtPosition.length) {
            for (const node of nodesAtPosition) {
                // try to find the real block in the AST and get the nodes in that scope
                if (node.nodeType === 'ContractDefinition') {
                    const contractNodes = fileNodes.contracts[node.name].contractNodes
                    for (const contractNode of Object.values(contractNodes)) {
                        if (contractNode['name'] === ANTLRBlock.name) {
                            console.log('found real block', contractNode)
                            let nodeOfScope = await this.props.plugin.call('codeParser', 'getNodesWithScope', (contractNode as any).id)
                            nodes = [...nodes, ...nodeOfScope]
                            if (contractNode['body']) {
                                nodeOfScope = await this.props.plugin.call('codeParser', 'getNodesWithScope', (contractNode['body'] as any).id)
                                nodes = [...nodes, ...nodeOfScope]
                            }
                        }
                    }
                }
                //const nodesOfScope = await this.props.plugin.call('codeParser', 'getNodesWithScope', node.id)
                // nodes = [...nodes, ...nodesOfScope]
            }
        }
        console.log('NODES AT BLOCK SCOPE', nodes)
        // we are only interested in nodes that are in the same block as the cursor
        nodes = nodes.filter(node => {
            if (node.src) {
                const position = sourceMappingDecoder.decode(node.src)
                if (position.start >= ANTLRBlock.range[0] && (position.start + position.length) <= ANTLRBlock.range[1]) {
                    return true
                }
            }
            return false
        })

        return nodes;
    }

    private getContractAtPosition = async (position: Position) => {
        const cursorPosition = this.props.editorAPI.getCursorPosition()
        let nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', cursorPosition)
        console.log('NODES AT POSITION', nodesAtPosition)
        // if no nodes exits at position, try to get the block of which the position is in
        const ANTLRBlock = await this.props.plugin.call('codeParser', 'getANTLRBlockAtPosition', position, null)
        if (!nodesAtPosition.length) {
            if (ANTLRBlock) {
                nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', ANTLRBlock.range[0])
            }
        }
        if (isArray(nodesAtPosition) && nodesAtPosition.length) {
            for (const node of nodesAtPosition) {
                if (node.nodeType === 'ContractDefinition') {
                    return node
                }
            }
        }
        return null
    }

    private getContractCompletions = async (position: Position) => {
        let nodes: any[] = []
        const cursorPosition = this.props.editorAPI.getCursorPosition()
        let nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', cursorPosition)
        console.log('NODES AT POSITION', nodesAtPosition)
        // if no nodes exits at position, try to get the block of which the position is in
        const block = await this.props.plugin.call('codeParser', 'getANTLRBlockAtPosition', position, null)
        console.log('BLOCK AT POSITION', block)
        if (!nodesAtPosition.length) {
            if (block) {
                nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', block.range[0])
            }
        }
        // find the contract and get the nodes of the contract and the base contracts and imports
        if (isArray(nodesAtPosition) && nodesAtPosition.length) {
            let contractNode: any = {}
            for (const node of nodesAtPosition) {
                if (node.nodeType === 'ContractDefinition') {
                    contractNode = node
                    const fileNodes = await this.props.plugin.call('codeParser', 'getCurrentFileNodes')
                    console.log('FILE NODES', fileNodes)
                    const contractNodes = fileNodes.contracts[node.name]
                    nodes = [...Object.values(contractNodes.contractScopeNodes), ...nodes]
                    nodes = [...Object.values(contractNodes.baseNodesWithBaseContractScope), ...nodes]
                    nodes = [...Object.values(fileNodes.imports), ...nodes]
                    // some types like Enum and Events are not scoped so we need to add them manually
                    nodes = [...contractNodes.contractDefinition.nodes, ...nodes]
                    // at the nodes at the block itself
                    nodes = [...nodes, ...await this.getBlockNodesAtPosition(position)]
                    // filter private nodes, only allow them when contract ID is the same as the current contract
                    nodes = nodes.filter(node => {
                        if (node.visibility) {
                            if (node.visibility === 'private') {
                                return (node.contractId ? node.contractId === contractNode.id : false) || false
                            }
                        }
                        return true
                    })
                    break;
                }

            }
        } else {
            // get all the nodes from a simple code parser which only parses the current file
            nodes = [...nodes, ...await this.props.plugin.call('codeParser', 'listAstNodes')]
        }
        return nodes
    }

    private getThisCompletions = async (position: Position) => {
        let nodes: any[] = []
        let thisCompletionNodes = await this.getContractCompletions(position)
        const allowedTypesForThisCompletion = ['VariableDeclaration', 'FunctionDefinition']
        // with this. you can't have internal nodes and no contractDefinitions
        thisCompletionNodes = thisCompletionNodes.filter(node => {
            console.log('node filter', node)
            if (node.visibility && (node.visibility === 'internal' || node.visibility === 'private')) {
                return false
            }
            if (node.nodeType && !allowedTypesForThisCompletion.includes(node.nodeType)) {
                return false
            }
            return true
        })
        nodes = [...nodes, ...thisCompletionNodes]
        setTimeout(() => {
            // eslint-disable-next-line no-debugger
            // debugger
        }, 2000)
        return nodes
    }

    private getDotCompletions = async (position: Position, nameOfLastTypedExpression: string) => {
        const contractCompletions = await this.getContractCompletions(position)
        let nodes: any[] = []

        const filterNodes = (nodes: any[], parentNode: any, declarationOf: any = null) => {
            return nodes && nodes.filter(node => {
                if (node.visibility) {
                    if(declarationOf && declarationOf.nodeType && declarationOf.nodeType === 'StructDefinition') {
                        return true
                    }
                    if ((node.visibility === 'internal' && !parentNode.isBaseNode) || node.visibility === 'private') {
                        return false
                    }
                }
                return true
            })
        }


        for (const nodeOfScope of contractCompletions) {
            // console.log('nodeOfScope', nodeOfScope.name, nodeOfScope)
            if (nodeOfScope.name === nameOfLastTypedExpression) {
                console.log('FOUND NODE', nodeOfScope)
                if (nodeOfScope.typeName && nodeOfScope.typeName.nodeType === 'UserDefinedTypeName') {
                    const declarationOf: AstNode = await this.props.plugin.call('codeParser', 'declarationOf', nodeOfScope.typeName)
                    console.log('METHOD 1 HAS DECLARATION OF', declarationOf)
                    nodes = [...nodes, 
                        ...filterNodes(declarationOf.nodes, nodeOfScope, declarationOf) 
                        || filterNodes(declarationOf.members, nodeOfScope, declarationOf)]
                    const baseContracts = await this.getlinearizedBaseContracts(declarationOf)
                    for (const baseContract of baseContracts) {
                        nodes = [...nodes, ...filterNodes(baseContract.nodes, nodeOfScope)]
                    }
                } else if (nodeOfScope.members) {
                    console.log('METHOD 1 HAS MEMBERS OF')
                    nodes = [...nodes, ...filterNodes(nodeOfScope.members, nodeOfScope)]
                }
            }
        }



        return nodes
    }

    private getlinearizedBaseContracts = async (node: any) => {
        let params = []
        if (node.linearizedBaseContracts) {
            for (const id of node.linearizedBaseContracts) {
                if (id !== node.id) {
                    const baseContract = await this.props.plugin.call('codeParser', 'getNodeById', id)
                    params = [...params, ...[baseContract]]
                }
            }
        }
        return params
    }

    /**
     * 
     * @param lineTextBeforeCursor 
     * @returns 
     */
    private async getLastNodeInExpression(lineTextBeforeCursor: string) {

        const wrapLineInFunction = async (text: string) => {
            return `function() {
                ${text}
            }`
        }

        let lastNodeInExpression

        const linesToCheck =
            [
                lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode;",
                lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode;}",
                lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode);",
                await wrapLineInFunction(lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode;"),
                await wrapLineInFunction(lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode;}"),
                await wrapLineInFunction(lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode;)"),
                await wrapLineInFunction(lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode)"),
                await wrapLineInFunction(lineTextBeforeCursor.substring(0, lineTextBeforeCursor.lastIndexOf('.')) + ".lastnode);"),
            ]

        for (const line of linesToCheck) {
            try {
                const lineAst = await this.props.plugin.call('codeParser', 'parseSolidity', line)
                const lastNode = await this.props.plugin.call('codeParser', 'getLastNodeInLine', lineAst)
                if (lastNode) {
                    lastNodeInExpression = lastNode
                    break
                }

            } catch (e) {

            }
        }
        return lastNodeInExpression
    }
}