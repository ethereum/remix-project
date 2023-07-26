import { Monaco } from "@monaco-editor/react"
import monaco from "../../types/monaco"
import { EditorUIProps } from "../remix-ui-editor"
import { default as fixes } from "./quickfixes"
import { monacoTypes } from "@remix-ui/editor"

export class RemixCodeActionProvider implements monaco.languages.CodeActionProvider {
  props: EditorUIProps
  monaco: Monaco
  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
  }

  async provideCodeActions (
    model: monaco.editor.ITextModel /**ITextModel*/,
    range: monaco.Range /**Range*/,
    context: monaco.languages.CodeActionContext /**CodeActionContext*/,
    token: monaco.CancellationToken /**CancellationToken*/
  ) {
    const actions = []
    for (const error of context.markers) {
      console.log('error----->', error)
      const errStrings = Object.keys(fixes)
      const errStr = errStrings.find(es => error.message.includes(es))
      if (errStr) {
        let fix = fixes[errStr]
        const cursorPosition = this.props.editorAPI.getHoverPosition({lineNumber: error.startLineNumber, column: error.startColumn})
        const nodeAtPosition = await this.props.plugin.call('codeParser', 'definitionAtPosition', cursorPosition)
        if (nodeAtPosition && nodeAtPosition.nodeType === "FunctionDefinition") {
          console.log('nodeAtPosition---->', nodeAtPosition)
          if (nodeAtPosition.parameters && nodeAtPosition.parameters.length > 0) {
            const paramNodes = nodeAtPosition.parameters
            const lastParamNode = paramNodes[paramNodes.length - 1]
            console.log('lastParamNode---->', lastParamNode)
            const lastParamEndLoc = lastParamNode.loc.end
            console.log('lastParamEndLoc---->', lastParamEndLoc)
            fix.range = {
              startLineNumber: lastParamEndLoc.line,
              endLineNumber: lastParamEndLoc.line,
              startColumn: lastParamEndLoc.column + 11,
              endColumn: lastParamEndLoc.column + 19
            }
          }
        }
        actions.push({
          title: fix.title,
          diagnostics: [error],
          kind: "quickfix",
          edit: {
            edits: [
              {
                resource: model.uri,
                edit: {
                  range: fix.range || error,
                  text: fix.message
                }
              }
            ]
          },
          isPreferred: true
        })
      }
    }

    return {
      actions: actions,
      dispose: () => {}
    }
  }
}