

export class RemixHoverProvider {

    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    provideHover = async function (model: any, position: any) {
        console.log('HOVERING')
        return await this.run(model, position)
        return new Promise((resolve, reject) => {
            this.props.plugin.once('contextualListener', 'astFinished', async () => {
                console.log('AST FINISHED')
                resolve(await this.run(model, position))
            })
            this.props.plugin.call('contextualListener', 'compile')
        })

    }
    async run(model: any, position: any) {
        const cursorPosition = this.props.editorAPI.getHoverPosition(position)

        const nodeAtPosition = await this.props.plugin.call('contextualListener', 'definitionAtPosition', cursorPosition)
        console.log(nodeAtPosition)
        const contents = []

        const getDocs = async (node: any) => {
            if (node.documentation && node.documentation.text) {
                let text = ''
                node.documentation.text.split('\n').forEach(line => {
                    text += `${line.trim()}\n`
                })
                contents.push({

                    value: text
                })
            }
        }

        const getScope = async (node: any) => {
            if (node.id) {
                contents.push({
                    value: `id: ${node.id}`
                })
            }
            if (node.scope) {
                contents.push({
                    value: `scope: ${node.scope}`
                })
            }

        }

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
            contents.push({
                value: `${filename} ${lineColumn.start.line}:${lineColumn.start.column}`
            })
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


        const getParamaters = async (parameters: any) => {
            if (parameters && parameters.parameters) {
                let params = []
                for (const param of parameters.parameters) {
                    params.push(await getVariableDeclaration(param))
                }
                return `(${params.join(', ')})`
            }
        }

        const getOverrides = async (node: any) => {
            if (node.overrides) {
                let overrides = []
                for (const override of node.overrides.overrides) {
                    overrides.push(override.name)
                }
                if (overrides.length)
                    return ` overrides (${overrides.join(', ')})`
            }
            return ''
        }

        const getlinearizedBaseContracts = async (node: any) => {
            let params = []
            for (const id of node.linearizedBaseContracts) {
                const baseContract = await this.props.plugin.call('contextualListener', 'getNodeById', id)
                params.push(
                    baseContract.name
                )
            }
            if (params.length)
                return `is ${params.join(', ')}`
            return ''
        }

        if (!nodeAtPosition) {
            contents.push({
                value: 'No definition found. Please compile the source code.'
            })
        }

        if (nodeAtPosition) {
            if (nodeAtPosition.absolutePath) {
                const target = await this.props.plugin.call('fileManager', 'getPathFromUrl', nodeAtPosition.absolutePath)
                if (target.file !== nodeAtPosition.absolutePath) {
                    contents.push({
                        value: `${target.file}`
                    })
                }
                contents.push({
                    value: `${nodeAtPosition.absolutePath}`
                })
            }
            if (nodeAtPosition.typeDescriptions && nodeAtPosition.nodeType === 'VariableDeclaration') {
                contents.push({
                    value: await getVariableDeclaration(nodeAtPosition)
                })

            }
            else if (nodeAtPosition.typeDescriptions && nodeAtPosition.nodeType === 'ElementaryTypeName') {
                contents.push({
                    value: `${nodeAtPosition.typeDescriptions.typeString}`
                })

            } else if (nodeAtPosition.nodeType === 'FunctionDefinition') {
                contents.push({
                    value: `function ${nodeAtPosition.name} ${await getParamaters(nodeAtPosition.parameters)} ${nodeAtPosition.visibility} ${nodeAtPosition.stateMutability}${await getOverrides(nodeAtPosition)} returns ${await getParamaters(nodeAtPosition.returnParameters)}`
                })


            } else if (nodeAtPosition.nodeType === 'ContractDefinition') {
                contents.push({
                    value: `${nodeAtPosition.contractKind} ${nodeAtPosition.name} ${await getlinearizedBaseContracts(nodeAtPosition)}`
                })


            } else {
                contents.push({
                    value: `${nodeAtPosition.nodeType}`
                })

            }

            for (const key in contents) {
                contents[key].value = '```remix-solidity\n' + contents[key].value + '\n```'
            }
            getLinks(nodeAtPosition)
            getDocs(nodeAtPosition)
            getScope(nodeAtPosition)
        }


        return {
            range: new this.monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                model.getLineMaxColumn(position.lineNumber)
            ),
            contents: contents
        };
    }

}