
export class RemixCompletionProvider {

    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    triggerCharacters = ['.', ' ']
    async provideCompletionItems(model: any, position: any) {
        const textUntilPosition = model.getValueInRange({
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: position.lineNumber,
			endColumn: position.column
		});
        console.log(textUntilPosition)
        return {
            suggestions: []
        }
    }
}