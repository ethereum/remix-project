import { Monaco } from "@monaco-editor/react"
import monaco from "../../types/monaco"
import { EditorUIProps } from "../remix-ui-editor"

export class RemixDefinitionProvider implements monaco.languages.DefinitionProvider {
    props: EditorUIProps
    monaco: Monaco
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async provideDefinition(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken): Promise<monaco.languages.Definition | monaco.languages.LocationLink[]> {
        const cursorPosition = this.props.editorAPI.getCursorPosition()
        await this.jumpToDefinition(cursorPosition)
        return null
    }

    async jumpToDefinition(position: any) {
        const node = await this.props.plugin.call('codeParser', 'definitionAtPosition', position)
        const sourcePosition = await this.props.plugin.call('codeParser', 'positionOfDefinition', node)
        console.log("JUMP", sourcePosition)
        if (sourcePosition) {
            await this.jumpToPosition(sourcePosition)
        }
    }



    /*
    * onClick jump to position of ast node in the editor
    */
    async jumpToPosition(position: any) {
        const jumpToLine = async (fileName: string, lineColumn: any) => {
            if (fileName !== await this.props.plugin.call('fileManager', 'file')) {
                console.log('jump to file', fileName)
                await this.props.plugin.call('contentImport', 'resolveAndSave', fileName, null, true)
                await this.props.plugin.call('fileManager', 'open', fileName)
            }
            if (lineColumn.start && lineColumn.start.line >= 0 && lineColumn.start.column >= 0) {
                this.props.plugin.call('editor', 'gotoLine', lineColumn.start.line, lineColumn.end.column + 1)
            }
        }
        const lastCompilationResult = await this.props.plugin.call('codeParser', 'getLastCompilationResult')  // await this.props.plugin.call('compilerArtefacts', 'getLastCompilationResult')
        console.log(lastCompilationResult.getSourceCode().sources)
        console.log(position)
        if (lastCompilationResult && lastCompilationResult.languageversion.indexOf('soljson') === 0 && lastCompilationResult.data) {

            const lineColumn = await this.props.plugin.call('codeParser', 'getLineColumnOfPosition', position)
            const filename = lastCompilationResult.getSourceName(position.file)
            // TODO: refactor with rendererAPI.errorClick
            console.log(filename, lineColumn)
            jumpToLine(filename, lineColumn)
        }
    }
}