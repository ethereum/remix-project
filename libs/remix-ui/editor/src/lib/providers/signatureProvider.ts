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
        const line = model.getLineContent(position.lineNumber);

        // find position of the opening parenthesis before the cursor
        const openParenIndex = line.lastIndexOf('(', position.column - 1);
        console.log(openParenIndex)
        const newPosition = new this.monaco.Position(position.lineNumber - 1, openParenIndex -1);
        const cursorPosition = this.props.editorAPI.getHoverPosition(newPosition)
        const nodeDefinition = await this.props.plugin.call('contextualListener', 'definitionAtPosition', cursorPosition)

        console.log(nodeDefinition)

        return {
            value: {
                signatures: [{
                    label: "test(var1, var2)",
                    parameters: [{
                        label: "var1",
                        documentation: "param 1"
                    },
                    {
                        label: "var2",
                        documentation: "param 2"
                    }]
                }],
                activeSignature: 0,
                activeParameter: 0
            },
            dispose: () => { }
        };
    }
}