import { sourceMappingDecoder } from "@remix-project/remix-debug"

export class RemixReferenceProvider {
    props: any
    monaco: any
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    async provideReferences(model: any, position: any, context: any, token: any) {

        const cursorPosition = this.props.editorAPI.getCursorPosition()
        const nodes = await this.props.plugin.call('contextualListener', 'referrencesAtPosition', cursorPosition)
        const references = []
        if (nodes && nodes.length) {
          const compilationResult = await this.props.plugin.call('compilerArtefacts', 'getLastCompilationResult')
          const file = await this.props.plugin.call('fileManager', 'file')
          if (compilationResult && compilationResult.data && compilationResult.data.sources[file]) {
            for (const node of nodes) {
              const position = sourceMappingDecoder.decode(node.src)
              const fileInNode = compilationResult.getSourceName(position.file)
              let fileTarget = await this.props.plugin.call('fileManager', 'getPathFromUrl', fileInNode)
              fileTarget = fileTarget.file
              const fileContent = await this.props.plugin.call('fileManager', 'readFile', fileInNode)
              const lineColumn = await this.props.plugin.call('offsetToLineColumnConverter', 'offsetToLineColumn',
                position,
                position.file,
                compilationResult.getSourceCode().sources,
                compilationResult.getAsts())
              console.log(position, fileTarget, lineColumn)
              try {
                this.props.plugin.call('editor', 'addModel', fileTarget, fileContent)
              } catch (e) {

              }
              const range = new this.monaco.Range(lineColumn.start.line + 1, lineColumn.start.column + 1, lineColumn.end.line + 1, lineColumn.end.column + 1)
              references.push({
                range,
                uri: this.monaco.Uri.parse(fileTarget)
              })
            }
          }
        }
        return references
      }
}