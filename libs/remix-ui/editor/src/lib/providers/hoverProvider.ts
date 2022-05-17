

export class RemixHoverProvide {

    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    provideHover = async function (model: any, position: any) {
        const cursorPosition = this.props.editorAPI.getHoverPosition(position)
        const nodeDefinition = await this.props.plugin.call('contextualListener', 'definitionAtPosition', cursorPosition)
        console.log(nodeDefinition)
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

        const getLinks = async (node: any) => {
            const position = await this.props.plugin.call('contextualListener', 'positionOfDefinition', node)
            const lastCompilationResult = await this.props.plugin.call('compilerArtefacts', 'getLastCompilationResult')
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

        if (!nodeDefinition) return null
        if (nodeDefinition.absolutePath) {
            const target = await this.props.plugin.call('fileManager', 'getPathFromUrl', nodeDefinition.absolutePath)
            if (target.file !== nodeDefinition.absolutePath) {
                contents.push({
                    value: `${target.file}`
                })
            }
            contents.push({
                value: `${nodeDefinition.absolutePath}`
            })
        }
        if (nodeDefinition.typeDescriptions && nodeDefinition.nodeType === 'VariableDeclaration') {
            contents.push({
                value: await getVariableDeclaration(nodeDefinition)
            })

        }
        else if (nodeDefinition.typeDescriptions && nodeDefinition.nodeType === 'ElementaryTypeName') {
            contents.push({
                value: `${nodeDefinition.typeDescriptions.typeString}`
            })

        } else if (nodeDefinition.nodeType === 'FunctionDefinition') {
            contents.push({
                value: `function ${nodeDefinition.name} ${await getParamaters(nodeDefinition.parameters)} ${nodeDefinition.visibility} ${nodeDefinition.stateMutability}${await getOverrides(nodeDefinition)} returns ${await getParamaters(nodeDefinition.returnParameters)}`
            })

            
        } else if (nodeDefinition.nodeType === 'ContractDefinition') {
            contents.push({
                value: `${nodeDefinition.contractKind} ${nodeDefinition.name} ${await getlinearizedBaseContracts(nodeDefinition)}`
            })


        } else {
            contents.push({
                value: `${nodeDefinition.nodeType}`
            })

        }

        for (const key in contents) {
            contents[key].value = '```remix-solidity\n' + contents[key].value + '\n```'
        }
        getLinks(nodeDefinition)
        getDocs(nodeDefinition)
        

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