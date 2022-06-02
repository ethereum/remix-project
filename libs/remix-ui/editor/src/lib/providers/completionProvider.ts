import { editor, languages, Position } from "monaco-editor"
import monaco from "../../types/monaco"
import { EditorUIProps } from "../remix-ui-editor"

export class RemixCompletionProvider implements languages.CompletionItemProvider {

    props: EditorUIProps
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    triggerCharacters = ['.', '']
    async provideCompletionItems(model: editor.ITextModel, position: Position, context: monaco.languages.CompletionContext) {
        console.log('AUTOCOMPLETE', context)
        console.log(position)

        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });




        const word = model.getWordUntilPosition(position);
        const wordAt = model.getWordAtPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        console.log('WORD', word)
        const getlinearizedBaseContracts = async (node: any) => {
            let params = []
            if (node.linearizedBaseContracts) {
                for (const id of node.linearizedBaseContracts) {
                    if (id !== node.id) {
                        const baseContract = await this.props.plugin.call('contextualListener', 'getNodeById', id)
                        params = [...params, ...[baseContract]]
                    }
                }
            }
            return params
        }


        const line = model.getLineContent(position.lineNumber)
        let nodes = []




        const cursorPosition = this.props.editorAPI.getCursorPosition()
        console.log('cursor', cursorPosition)

        if (context.triggerCharacter === '.') {
            console.clear()
            console.log('TEXT', line)
            const textBeforeCursor = line.substring(0, position.column - 1)
            const textAfterCursor = line.substring(position.column - 1)
            // parse the line witout changing the line

            const wrapLineInFunction = (text: string) => {
                return `function() {
                    ${text}
                }`
            }

            let lastNode
            const checkLastNode = (node) => {
                if (!node) return
                if (lastNode && lastNode.range && lastNode.range[1]) {
                    if (node.range[1] > lastNode.range[1]) {
                        lastNode = node
                    }
                } else {
                    lastNode = node
                }
            }


            const linesToCheck =
                [
                    textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('.')) + ".lastnode;",
                    textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('.')) + ".lastnode;}",
                    textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('.')) + ".lastnode);",
                    wrapLineInFunction(textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('.')) + ".lastnode;"),
                    wrapLineInFunction(textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('.')) + ".lastnode;}"),
                    wrapLineInFunction(textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('.')) + ".lastnode;)"),
                ]

            for (const line of linesToCheck) {
                try {
                    const lineAst = await this.props.plugin.call('contextualListener', 'parseSource', line)
                    const lastNode = await this.props.plugin.call('contextualListener', 'getLastNodeInLine', lineAst)
                    checkLastNode(lastNode)
                } catch (e) {

                }
            }

            console.log('lastNode found', lastNode)



            console.log(textBeforeCursor, textAfterCursor)
            const splits = textBeforeCursor.split('.')

            console.log('splits', splits)
            if (splits.length > 1) {
                let last = splits[splits.length - 2].trim()
                const lastParentheses = last.lastIndexOf('(')
                const lastClosingParentheses = last.lastIndexOf(')')
                const lastBracket = last.lastIndexOf('{')
                const lastSemiColon = last.lastIndexOf(';')
                let textBefore = null
                let lastWord = null
                let lineWithoutEdits = null
                // get word before last closing parentheses
                if (lastParentheses > -1 && lastClosingParentheses > -1) {
                    //textBefore = last.substring(0, lastParentheses)
                }
                // find largest 
                const lastIndex = Math.max(lastParentheses, lastBracket, lastSemiColon)
                if (lastIndex > -1) {
                    lastWord = last.substring(lastIndex + 1)
                    textBefore = last.substring(0, lastIndex + 1)
                    console.log('textBefore', textBefore)
                    console.log('text without edits', textBefore, textAfterCursor)
                    lineWithoutEdits = `${textBefore}${textAfterCursor}`
                }
                last = lastNode.name || lastNode.memberName
                console.log('last', last)

                const lines = model.getLinesContent()
                lines[position.lineNumber - 1] = lineWithoutEdits

                const textWithoutEdits = lines.join('\n')
                console.log('textWithoutEdits', textWithoutEdits)

                let nodesAtPosition = await this.props.plugin.call('contextualListener', 'nodesAtEditorPosition', cursorPosition)

                console.log('NODES AT POSITION', nodesAtPosition)
                const block = await this.props.plugin.call('contextualListener', 'getBlockName', position, textWithoutEdits)
                console.log('BLOCK', block)
                //if (!nodesAtPosition.length) {
                if (block) {
                    nodesAtPosition = await this.props.plugin.call('contextualListener', 'nodesAtEditorPosition', block.body ? block.body.range[0] : block.range[0])
                    console.log('NODES AT POSITION WITH BLOCK', nodesAtPosition)
                }
                //}
                // explore nodes at the BLOCK
                if (nodesAtPosition) {
                    for (const node of nodesAtPosition) {
                        const nodesOfScope = await this.props.plugin.call('contextualListener', 'nodesWithScope', node.id)
                        console.log('NODES OF SCOPE ', node.name, node.id, nodesOfScope)
                        for (const nodeOfScope of nodesOfScope) {
                            if (nodeOfScope.name === last) {
                                console.log('FOUND NODE', nodeOfScope)
                                if (nodeOfScope.typeName && nodeOfScope.typeName.nodeType === 'UserDefinedTypeName') {
                                    const declarationOf = await this.props.plugin.call('contextualListener', 'declarationOf', nodeOfScope.typeName)
                                    console.log('HAS DECLARATION OF', declarationOf)
                                    nodes = [...nodes, ...declarationOf.nodes || declarationOf.members]
                                    const baseContracts = await getlinearizedBaseContracts(declarationOf)
                                    for (const baseContract of baseContracts) {
                                        nodes = [...nodes, ...baseContract.nodes]
                                    }
                                }
                            }
                        }
                    }
                    // anything within the block statements might provide a clue to what it is
                    if (!nodes.length) {
                        for (const node of nodesAtPosition) {
                            if (node.statements) {
                                for (const statement of node.statements) {
                                    if (statement.expression && statement.expression.memberName === last) {
                                        const declarationOf = await this.props.plugin.call('contextualListener', 'declarationOf', statement.expression)
                                        if (declarationOf.typeName && declarationOf.typeName.nodeType === 'UserDefinedTypeName') {
                                            const baseDeclaration = await this.props.plugin.call('contextualListener', 'declarationOf', declarationOf.typeName)
                                            console.log('HAS BASE DECLARATION OF', baseDeclaration)
                                            nodes = [...nodes, ...baseDeclaration.nodes || baseDeclaration.members]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }


                // brute force search in all nodes with the name
                if (!nodes.length) {
                    const nodesOfScope = await this.props.plugin.call('contextualListener', 'nodesWithName', last)
                    console.log('NODES WITHE NAME ', last, nodesOfScope)
                    for (const nodeOfScope of nodesOfScope) {
                        if (nodeOfScope.name === last) {
                            console.log('FOUND NODE', nodeOfScope)
                            if (nodeOfScope.typeName && nodeOfScope.typeName.nodeType === 'UserDefinedTypeName') {
                                const declarationOf = await this.props.plugin.call('contextualListener', 'declarationOf', nodeOfScope.typeName)
                                console.log('HAS DECLARATION OF', declarationOf)
                                // nodes = [...nodes, ...declarationOf.nodes || declarationOf.members]
                                const baseContracts = await getlinearizedBaseContracts(declarationOf)
                                for (const baseContract of baseContracts) {
                                    //nodes = [...nodes, ...baseContract.nodes]
                                }
                            }
                        }
                    }
                }
            }
        } else {
            const cursorPosition = this.props.editorAPI.getCursorPosition()
            let nodesAtPosition = await this.props.plugin.call('contextualListener', 'nodesAtEditorPosition', cursorPosition)
            nodes = []
            console.log('NODES AT POSITION', nodesAtPosition)
            if (!nodesAtPosition.length) {
                const block = await this.props.plugin.call('contextualListener', 'getBlockName', position, null)
                console.log('BLOCK', block)
                if (block) {
                    nodesAtPosition = await this.props.plugin.call('contextualListener', 'nodesAtEditorPosition', block.range[0])
                    console.log('NODES AT POSITION', nodesAtPosition)
                }
            }

            // get all children of all nodes at position
            for (const node of nodesAtPosition) {
                const nodesOfScope = await this.props.plugin.call('contextualListener', 'nodesWithScope', node.id)
                for (const nodeOfScope of nodesOfScope) {
                    const imports = await this.props.plugin.call('contextualListener', 'resolveImports', nodeOfScope)
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
                const baseContracts = await getlinearizedBaseContracts(node)
                for (const baseContract of baseContracts) {
                    nodes = [...nodes, ...baseContract.nodes]
                }
            }



            //nodes  = await this.props.plugin.call('contextualListener', 'getNodes')
        }


        console.log('WORD', word, wordAt)
        console.log('NODES', nodes)
        console.log('NODES', Object.values(nodes))



        const getLinks = async (node: any) => {
            const position = await this.props.plugin.call('contextualListener', 'positionOfDefinition', node)
            const lastCompilationResult = await this.props.plugin.call('contextualListener', 'getLastCompilationResult')
            const filename = lastCompilationResult.getSourceName(position.file)
            const lineColumn = await this.props.plugin.call('offsetToLineColumnConverter', 'offsetToLineColumn',
                position,
                position.file,
                lastCompilationResult.getSourceCode().sources,
                lastCompilationResult.getAsts())
            return `${filename} ${lineColumn.start.line}:${lineColumn.start.column}`
        }

        const getDocs = async (node: any) => {
            if (node.documentation && node.documentation.text) {
                let text = ''
                node.documentation.text.split('\n').forEach(line => {
                    text += `${line.trim()}\n`
                })
                return text
            }
        }

        const getParamaters = async (parameters: any) => {
            if (parameters && parameters.parameters) {
                const params = []
                for (const param of parameters.parameters) {
                    params.push(await getVariableDeclaration(param))
                }
                return `(${params.join(', ')})`
            }
        }

        const completeParameters = async (parameters: any) => {
            if (parameters && parameters.parameters) {
                const params = []
                for (const param of parameters.parameters) {
                    params.push(param.name)
                }
                return `(${params.join(', ')})`
            }
        }


        const getVariableDeclaration = async (node: any) => {
            if (node.typeDescriptions && node.typeDescriptions.typeString) {
                return `${node.typeDescriptions.typeString}${node.name && node.name.length ? ` ${node.name}` : ''}`
            } else
                if (node.typeName && node.typeName.name) {
                    return `${node.typeName.name}${node.name && node.name.length ? ` ${node.name}` : ''}`
                } else {
                    return `${node.name && node.name.length ? ` ${node.name}` : ''}`
                }
        }

        const suggestions = []
        for (const node of Object.values(nodes) as any[]) {
            if (!node.name) continue
            if (node.nodeType === 'VariableDeclaration') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` ${await getVariableDeclaration(node)}` },
                    kind: this.monaco.languages.CompletionItemKind.Variable,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if (node.nodeType === 'FunctionDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` -> ${node.name} ${await getParamaters(node.parameters)}` },
                    kind: this.monaco.languages.CompletionItemKind.Function,
                    insertText: `${node.name}${await completeParameters(node.parameters)};`,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'ContractDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Interface,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'StructDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Struct,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'EnumDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Enum,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'EventDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Event,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
                (node.nodeType === 'ModifierDefinition') {
                const completion = {
                    label: { label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}` },
                    kind: this.monaco.languages.CompletionItemKind.Method,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            }
        }

        console.log(suggestions)
        return {
            suggestions
        }
    }
}