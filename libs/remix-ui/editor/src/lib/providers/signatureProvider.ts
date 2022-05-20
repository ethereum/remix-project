// https://github.com/maziac/binary-file-viewer/blob/c71ab6043867717327ef546f1646938fd4733548/src/signatureprovider.ts
export class RemixSignatureProvider {

    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    public signatureHelpTriggerCharacters = ['(', ','];
    async provideSignatureHelp(model: any, position: any, token: any, context: any) {
        console.log(`providing signature help`, context);
        console.log(position)

        return new Promise((resolve, reject) => {
            this.props.plugin.once('contextualListener', 'astFinished', async() => {
                console.log('AST FINISHED')
                resolve (await this.run(model, position, token, context))
            })
            this.props.plugin.call('contextualListener', 'compile').then(async () => {  
            })
        })



    }

    parseParamaters(lineTrimmed: string) {
        const len = lineTrimmed.length;
        let modLine = '';
		let k = 0;
		while (k < len) {
			const char = lineTrimmed.substring(k, k+1);
			if (char == "'" || char == '"') {
				do {
					k++;
					if (k >= len)
						break;
					const nChar = lineTrimmed.substring(k, k+1);
					if (nChar == char)
						break;
				} while (k < len);
				k++;
				continue;
			}
			modLine += char;
			k++;
		}
        console.log('MODLINE', modLine)
    }


    async run(model: any, position: any, token: any, context: any){
        const line = model.getLineContent(position.lineNumber);
        const lineTrimmed = line.trim();
        this.parseParamaters(lineTrimmed)
        // find position of the opening parenthesis before the cursor
        const openParenIndex = line.lastIndexOf('(', position.column - 1);
        console.log(openParenIndex)
        const newPosition = new this.monaco.Position(position.lineNumber, openParenIndex -1);
        const cursorPosition = this.props.editorAPI.getHoverPosition(newPosition)
        const nodeDefinition = await this.props.plugin.call('contextualListener', 'definitionAtPosition', cursorPosition)

        const getVariableDeclaration = async (node: any) => {
            if (node.typeDescriptions && node.typeDescriptions.typeString) {
                return `${node.typeDescriptions.typeString}${node.name && node.name.length ? ` ${node.name}` : ''}`
            } else
            if(node.typeName && node.typeName.name){
                return `${node.typeName.name}${node.name && node.name.length ? ` ${node.name}` : ''}`
            } else {
                return `${node.name && node.name.length ? ` ${node.name}` : ''}`
            }
        }

        const getParamaters = async (parameters: any) => {
            console.log('PARAMETERS', parameters)
            if (parameters && parameters.parameters) {
                let params = []
                for (const param of parameters.parameters) {
                    params.push(await getVariableDeclaration(param))
                }
                console.log('PARAMS', params)
                return params
            }
        }

        const getParamtersString = async (parameters: any) => {
            if(parameters)
                return `(${(await getParamaters(parameters)).join(', ')})`
            return ''
        }

        const getParameterLabels = async (parameters: any) => {
            const params = await getParamaters(parameters)
            if(!params) return []
            const arr = params.map(param => {
                return {
                    label: param,
                    documentation: param
                }
            })
            console.log(arr)
            return arr
        }

        console.log('DEFS', nodeDefinition)

        if(!nodeDefinition.nodeType || nodeDefinition.nodeType !== 'FunctionDefinition') return null

        return {
            value: {
                signatures: [{
                    label:`function ${nodeDefinition.name} ${await getParamtersString(nodeDefinition.parameters)}`,
                    parameters: await getParameterLabels(nodeDefinition.parameters),
                }],
                activeSignature: 0,
                activeParameter: 0
            },
            dispose: () => { }
        };
    }
}