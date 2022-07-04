import { lineText } from "../remix-ui-editor"

export class RemixCodeLensProvider {
    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }


    async provideCodeLenses(model: any, token: any) {
        
        const gasEstimates = await this.props.plugin.call('codeParser', 'getGasEstimates')
        const decorations = []
        const friendlyNames = {
            'executionCost': 'Execution Cost',
            'codeDepositCost': 'Code Deposit Cost',
            'creationCost': 'Creation Cost',
        }

/*         if (gasEstimates) {
            for (const estimate of gasEstimates) {
                console.log(estimate)
                const linetext: lineText = {
                    content: Object.entries(estimate.node.gasEstimate).map(([key, value]) => `${friendlyNames[key]}: ${value} gas`).join(' '),
                    position: estimate.range.position,
                    hide: false,
                    className: 'remix-code-lens',
                    from: 'remix-code-lens',
                }
                
                this.props.plugin.call('editor', 'addLineText', linetext, estimate.range.fileName)
                

            }

        } */

        return {
            lenses: [],
            dispose: () => { }
        };
    }

}
