import monaco from '../../types/monaco'

export class RemixHoverProvider implements monaco.languages.HoverProvider {

    props: any
    constructor(props: any) {
        this.props = props
    }

    provideHover = async function (model: any, position: monaco.Position) {
        const cursorPosition = this.propseditorAPI.getHoverPosition(position)
        const nodeDefinition = await this.propsplugin.call('contextualListener', 'definitionAtPosition', cursorPosition)
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
            const position = await this.propsplugin.call('contextualListener', 'positionOfDefinition', node)
            const lastCompilationResult = await this.propsplugin.call('compilerArtefacts', 'getLastCompilationResult')
            const filename = lastCompilationResult.getSourceName(position.file)
            console.log(filename, position)
            const lineColumn = await this.propsplugin.call('offsetToLineColumnConverter', 'offsetToLineColumn',
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
                return ''
            }
        }

        const getlinearizedBaseContracts = async (node: any) => {
            let params = []
            for (const id of node.linearizedBaseContracts) {
                const baseContract = await this.propsplugin.call('contextualListener', 'getNodeById', id)
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
            const target = await this.propsplugin.call('fileManager', 'getPathFromUrl', nodeDefinition.absolutePath)
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

            getDocs(nodeDefinition)
        } else if (nodeDefinition.nodeType === 'ContractDefinition') {
            contents.push({
                value: `${nodeDefinition.contractKind} ${nodeDefinition.name} ${await getlinearizedBaseContracts(nodeDefinition)}`
            })
            getDocs(nodeDefinition)

        } else {
            contents.push({
                value: `${nodeDefinition.nodeType}`
            })
            getDocs(nodeDefinition)
        }
        getLinks(nodeDefinition)
        for (const key in contents) {
            contents[key].value = '```remix-solidity\n' + contents[key].value + '\n```'
        }

        return {
            range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                model.getLineMaxColumn(position.lineNumber)
            ),
            contents: contents
        };
    }

}