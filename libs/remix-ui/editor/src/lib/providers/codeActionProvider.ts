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
      let fix
      let msg
      const errStrings = Object.keys(fixes)
      const errStr = errStrings.find(es => error.message.includes(es))
      if (errStr) {
        fix = fixes[errStr]
        const cursorPosition = this.props.editorAPI.getHoverPosition({lineNumber: error.startLineNumber, column: error.startColumn})
        const nodeAtPosition = await this.props.plugin.call('codeParser', 'definitionAtPosition', cursorPosition)
        if (nodeAtPosition && nodeAtPosition.nodeType === "FunctionDefinition") {
          if (nodeAtPosition.parameters && nodeAtPosition.parameters && nodeAtPosition.parameters.length > 0) {
            const paramNodes = nodeAtPosition.parameters
            const lastParamNode = paramNodes[paramNodes.length - 1]
            const lastParamEndLoc = lastParamNode.loc.end
            const lineContent = model.getLineContent(lastParamEndLoc.line)
            msg = lineContent.substring(0, lastParamEndLoc.column + 10) + fix.message + lineContent.substring(lastParamEndLoc.column + 10, lineContent.length)
            fix.range = {
              startLineNumber: lastParamEndLoc.line,
              endLineNumber: lastParamEndLoc.line,
              startColumn: 0,
              endColumn: error.startColumn + msg.length
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
                  text: msg || fix.message
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