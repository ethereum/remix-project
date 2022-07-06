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
        console.log(position)

        const word = model.getWordUntilPosition(position);
        const wordAt = model.getWordAtPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        console.log('WORD', word)

        const line = model.getLineContent(position.lineNumber)
        let nodes = []
        let suggestions = []

        const cursorPosition = this.props.editorAPI.getCursorPosition()
        console.log('cursor', cursorPosition)

        if (context.triggerCharacter === '.') {
            console.clear()
            console.log('TEXT', line)
            const lineTextBeforeCursor = line.substring(0, position.column - 1)
            const lastNodeInExpression = await this.getLastNodeInExpression(lineTextBeforeCursor)
            console.log('lastNode found', lastNodeInExpression)
            console.log(lineTextBeforeCursor)
            const expressionElements = lineTextBeforeCursor.split('.')

            console.log('expression elements', expressionElements)
            let dotCompleted = false
            //if (expressionElements.length === 2) {
            const globalCompletion = getContextualAutoCompleteByGlobalVariable(lastNodeInExpression.name, range, this.monaco)
            if (globalCompletion) {
                dotCompleted = true
                suggestions = [...suggestions, ...globalCompletion]
            }
            if (lastNodeInExpression.name === 'this') {
                dotCompleted = true
                let thisCompletionNodes = await this.getContractCompletions(nodes, position)
                thisCompletionNodes = thisCompletionNodes.filter(node => 
                {
                    if(node.visibility && node.visibility === 'internal') {
                        return false
                    }
                    return true
                })
                nodes = [...nodes, ...thisCompletionNodes]
            }
            //}
            if (expressionElements.length > 1 && !dotCompleted) {

                const last = lastNodeInExpression.name || lastNodeInExpression.memberName
                console.log('last', last)

                let nodesAtPosition;

                const block = await this.props.plugin.call('codeParser', 'getBlockAtPosition', position, null)
                console.log('BLOCK', block)

                if (block) {
                    nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', block.body ? block.body.range[0] : block.range[0])
                    console.log('NODES AT POSITION WITH BLOCK', nodesAtPosition)
                } else {
                    nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', cursorPosition)
                    console.log('NODES AT POSITION', nodesAtPosition)
                }

                // explore nodes at the BLOCK
                if (nodesAtPosition) {
                    for (const node of nodesAtPosition) {
                        const nodesOfScope = await this.props.plugin.call('codeParser', 'getNodesWithScope', node.id)
                        console.log('NODES OF SCOPE ', node.name, node.id, nodesOfScope)
                        for (const nodeOfScope of nodesOfScope) {
                            if (nodeOfScope.name === last) {
                                console.log('FOUND NODE', nodeOfScope)
                                if (nodeOfScope.typeName && nodeOfScope.typeName.nodeType === 'UserDefinedTypeName') {
                                    const declarationOf = await this.props.plugin.call('codeParser', 'declarationOf', nodeOfScope.typeName)
                                    console.log('METHOD 1 HAS DECLARATION OF', declarationOf)
                                    nodes = [...nodes, ...declarationOf.nodes || declarationOf.members]
                                    const baseContracts = await this.getlinearizedBaseContracts(declarationOf)
                                    for (const baseContract of baseContracts) {
                                        nodes = [...nodes, ...baseContract.nodes]
                                    }
                                }
                            }
                        }
                    }
                    // anything within the block statements might provide a clue to what it is
                    // if (!nodes.length) {
                    for (const node of nodesAtPosition) {
                        if (node.statements) {
                            for (const statement of node.statements) {
                                if (statement.expression && statement.expression.memberName === last) {
                                    const declarationOf = await this.props.plugin.call('codeParser', 'declarationOf', statement.expression)
                                    if (declarationOf.typeName && declarationOf.typeName.nodeType === 'UserDefinedTypeName') {
                                        const baseDeclaration = await this.props.plugin.call('codeParser', 'declarationOf', declarationOf.typeName)
                                        console.log('METHOD 2 HAS BASE DECLARATION OF', baseDeclaration)
                                        nodes = [...nodes, ...baseDeclaration.nodes || baseDeclaration.members]
                                    }
                                }
                            }
                        }
                    }
                }
                // }

                // brute force search in all nodes with the name
                //if (!nodes.length || 1) {
                    const nodesOfScope = await this.props.plugin.call('codeParser', 'getNodesWithName', last)
                    console.log('NODES WITHE NAME ', last, nodesOfScope)
                    for (const nodeOfScope of nodesOfScope) {
                        if (nodeOfScope.name === last) {
                            console.log('FOUND NODE', nodeOfScope)
                            if (nodeOfScope.typeName && nodeOfScope.typeName.nodeType === 'UserDefinedTypeName') {
                                const declarationOf = await this.props.plugin.call('codeParser', 'declarationOf', nodeOfScope.typeName)
                                console.log('METHOD 3 HAS DECLARATION OF', declarationOf)
                                nodes = [...nodes, ...declarationOf.nodes || declarationOf.members]
                                //const baseContracts = await this.getlinearizedBaseContracts(declarationOf)
                                //for (const baseContract of baseContracts) {
                                //nodes = [...nodes, ...baseContract.nodes]
                                //}
                            }
                        }
                    }
                //}
            }
        } else {

            suggestions = [...suggestions,
            ...GetGlobalVariable(range, this.monaco),
            ...getCompletionSnippets(range, this.monaco),
            ...GetCompletionTypes(range, this.monaco),
            ...GetCompletionKeywords(range, this.monaco),
            ...GetGlobalFunctions(range, this.monaco),
            ...GeCompletionUnits(range, this.monaco),
            ]
            nodes = [...nodes, ...await this.getContractCompletions(nodes, position)]

        }

        console.log('WORD', word, wordAt)
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
                    label: { label: `"${node.name}"`, description: await getNodeLink(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Event,
                    insertText: node.name,
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
            } else {
                console.log('UNKNOWN NODE', node)
            }
        }

        console.log(suggestions)
        return {
            suggestions
        }
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

    private getContractCompletions = async (nodes: any[], position: Position) => {
        const cursorPosition = this.props.editorAPI.getCursorPosition()
        let nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', cursorPosition)
        console.log('NODES AT POSITION', nodesAtPosition)
        // if no nodes exits at position, try to get the block of which the position is in
        if (!nodesAtPosition.length) {
            const block = await this.props.plugin.call('codeParser', 'getBlockAtPosition', position, null)
            if (block) {
                nodesAtPosition = await this.props.plugin.call('codeParser', 'nodesAtPosition', block.range[0])
            }
        }

        // get all children of all nodes at position
        if (isArray(nodesAtPosition) && nodesAtPosition.length) {
            for (const node of nodesAtPosition) {
                const nodesOfScope = await this.props.plugin.call('codeParser', 'getNodesWithScope', node.id)
                for (const nodeOfScope of nodesOfScope) {
                    const imports = await this.props.plugin.call('codeParser', 'resolveImports', nodeOfScope)
                    if (imports) {
                        for (const key in imports) {
                            if (imports[key].nodes)
                                nodes = [...nodes, ...imports[key].nodes]
                        }
                    }
                }
                nodes = [...nodes, ...nodesOfScope]
            }
            // get the linearized base contracts
            for (const node of nodesAtPosition) {
                const baseContracts = await this.getlinearizedBaseContracts(node)
                for (const baseContract of baseContracts) {
                    nodes = [...nodes, ...baseContract.nodes]
                }
            }
        } else {
            // get all the nodes from a simple code parser which only parses the current file
            nodes = [...nodes, ...await this.props.plugin.call('codeParser', 'listAstNodes')]
        }

        return nodes
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