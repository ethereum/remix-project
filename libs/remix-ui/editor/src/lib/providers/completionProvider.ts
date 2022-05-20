
export class RemixCompletionProvider {

    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    async provideCompletionItems(model: any, position: any) {
        console.log('AUTOCOMPLETE')
        return new Promise((resolve, reject) => {
            this.props.plugin.once('contextualListener', 'astFinished', async () => {
                console.log('AST FINISHED')
                resolve(await this.run(model, position))
            })
            this.props.plugin.call('contextualListener', 'compile')
        })
    }

    async run(model: any, position: any) {
        const textUntilPosition = model.getValueInRange({
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: position.lineNumber,
			endColumn: position.column
		});

		const word = model.getWordUntilPosition(position);
		const range = {
			startLineNumber: position.lineNumber,
			endLineNumber: position.lineNumber,
			startColumn: word.startColumn,
			endColumn: word.endColumn
		};
        const nodes = await this.props.plugin.call('contextualListener', 'getNodes')

        console.log('NODES', nodes)
        console.log('NODES', Object.values(nodes))

        const getLinks = async (node: any) => {
            const position = await this.props.plugin.call('contextualListener', 'positionOfDefinition', node)
            const lastCompilationResult = await this.props.plugin.call('contextualListener', 'getLastCompilationResult')
            const filename = lastCompilationResult.getSourceName(position.file)
            console.log(filename, position)
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
                let params = []
                for (const param of parameters.parameters) {
                    params.push(await getVariableDeclaration(param))
                }
                return `(${params.join(', ')})`
            }
        }

        const completeParameters = async (parameters: any) => {
            if (parameters && parameters.parameters) {
                let params = []
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
        for(const node of Object.values(nodes) as any[]){
            if (node.nodeType === 'VariableDeclaration') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` ${await getVariableDeclaration(node)}`},
                    kind: this.monaco.languages.CompletionItemKind.Variable,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else
            if (node.nodeType === 'FunctionDefinition') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` -> ${node.name} ${await getParamaters(node.parameters)}`},
                    kind: this.monaco.languages.CompletionItemKind.Function,
                    insertText: `${node.name} ${await completeParameters(node.parameters)}`,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
            (node.nodeType === 'ContractDefinition') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}`},
                    kind: this.monaco.languages.CompletionItemKind.Interface,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
            (node.nodeType === 'StructDefinition') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}`},
                    kind: this.monaco.languages.CompletionItemKind.Struct,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
            (node.nodeType === 'EnumDefinition') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}`},
                    kind: this.monaco.languages.CompletionItemKind.Enum,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
            (node.nodeType === 'EventDefinition') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}`},
                    kind: this.monaco.languages.CompletionItemKind.Event,
                    insertText: node.name,
                    range: range,
                    documentation: await getDocs(node)
                }
                suggestions.push(completion)
            } else if
            (node.nodeType === 'ModifierDefinition') {
                const completion = {
                    label: {label: `"${node.name}"`, description: await getLinks(node), detail: ` ${node.name}`},
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