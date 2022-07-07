import { CodeParser } from "../code-parser";
import { lineText } from '@remix-ui/editor'

export default class CodeParserGasService {
    plugin: CodeParser  

    constructor(plugin: CodeParser) {
        this.plugin = plugin
    }

    async getGasEstimates(fileName: string) {
        if (!fileName) {
            fileName = await this.plugin.currentFile
        }
        if (this.plugin._index.NodesPerFile && this.plugin._index.NodesPerFile[fileName]) {
            const estimates: any = []
            for (const contract in this.plugin._index.NodesPerFile[fileName]) {
                console.log(contract)
                const nodes = this.plugin._index.NodesPerFile[fileName][contract].contractNodes
                for (const node of Object.values(nodes) as any[]) {
                    if (node.gasEstimate) {
                        estimates.push({
                            node,
                            range: await this.plugin.getLineColumnOfNode(node)
                        })
                    }
                }
            }
            return estimates
        }

    }


    async showGasEstimates() {
        this.plugin.currentFile = await this.plugin.call('fileManager', 'file')
        this.plugin._index.NodesPerFile[this.plugin.currentFile] = await this.plugin._extractFileNodes(this.plugin.currentFile, this.plugin.compilerAbstract)

        const gasEstimates = await this.getGasEstimates(this.plugin.currentFile)
        console.log('all estimates', gasEstimates)

        const friendlyNames = {
            'executionCost': 'Estimated execution cost',
            'codeDepositCost': 'Estimated code deposit cost',
            'creationCost': 'Estimated creation cost',
        }
        await this.plugin.call('editor', 'discardLineTexts')
        if (gasEstimates) {
            for (const estimate of gasEstimates) {
                console.log(estimate)
                const linetext: lineText = {
                    content: Object.entries(estimate.node.gasEstimate).map(([key, value]) => `${value} gas`).join(' '),
                    position: estimate.range,
                    hide: false,
                    className: 'text-muted small',
                    afterContentClassName: 'text-muted small fas fa-gas-pump pl-4',
                    from: 'codeParser',
                    hoverMessage: [{
                        value: `${Object.entries(estimate.node.gasEstimate).map(([key, value]) => `${friendlyNames[key]}: ${value} gas`).join(' ')}`,
                    },
                    ],
                }

                this.plugin.call('editor', 'addLineText', linetext, estimate.range.fileName)


            }
        }
    }


}