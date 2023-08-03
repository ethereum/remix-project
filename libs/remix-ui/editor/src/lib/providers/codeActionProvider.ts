import { Monaco } from "@monaco-editor/react"
import monaco from "../../types/monaco"
import { EditorUIProps } from "../remix-ui-editor"
import { default as fixes } from "./quickfixes"

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
        // Check if a function is hovered
        if (nodeAtPosition && nodeAtPosition.nodeType === "FunctionDefinition") {
          // Identify type of AST node
          if (nodeAtPosition.parameters && !Array.isArray(nodeAtPosition.parameters) && Array.isArray(nodeAtPosition.parameters.parameters)) {
            const paramNodes = nodeAtPosition.parameters.parameters
            // If method has parameters
            if (paramNodes.length) msg = await this.fnWithParamsQFMsg(model, paramNodes, fix, error, true) 
            else msg = await this.fnWithoutParamsQFMsg(model, nodeAtPosition, fix, error, true)
          } else {
            const paramNodes = nodeAtPosition.parameters
            // If method has parameters
            if (paramNodes.length) msg = await this.fnWithParamsQFMsg(model, paramNodes, fix, error, false)
            else msg = await this.fnWithoutParamsQFMsg(model, nodeAtPosition, fix, error, false) 
          }
        } else if (fix && nodeAtPosition && fix.nodeType !== nodeAtPosition.nodeType) return
        if (Array.isArray(fix)) 
          for (const element of fix)
            this.addQuickFix(actions, error, model.uri, {title: element.title, range: element.range || error, text: msg || element.message})
        else this.addQuickFix(actions, error, model.uri, {title: fix.title, range: fix.range || error, text: msg || fix.message})
      }
    }

    return {
      actions: actions,
      dispose: () => {}
    }
  }

  addQuickFix(actions, error, uri, fixDetails) {
    const {title, range, text} = fixDetails
    actions.push({
      title,
      diagnostics: [error],
      kind: "quickfix",
      edit: {
        edits: [
          {
            resource: uri,
            edit: { range, text }
          }
        ]
      },
      isPreferred: true
    })
  }

  async fnWithParamsQFMsg(model, paramNodes, fix, error, isOldAST) {
    let lastParamEndLoc, fixLineNumber, msg
    // Get last function parameter node
    const lastParamNode = paramNodes[paramNodes.length - 1]
    if (isOldAST) {
      const location = await this.props.plugin.call('codeParser', 'getLineColumnOfNode', lastParamNode)
      // Get end location of last function parameter, it returns end column of parameter name
      lastParamEndLoc = location.end
      fixLineNumber = lastParamEndLoc.line + 1
    } else {
      // Get end location of last function parameter, it returns start column of parameter name
      lastParamEndLoc = lastParamNode.loc.end
      fixLineNumber = lastParamEndLoc.line
    }
    const lineContent = model.getLineContent(fixLineNumber)
    if (fix.id === 5 && lineContent.includes(' view '))
      msg = lineContent.replace('view', 'pure')
    else if (isOldAST)
      msg = lineContent.substring(0, lastParamEndLoc.column + 2) + fix.message + lineContent.substring(lastParamEndLoc.column + 1, lineContent.length)
    else 
      msg = lineContent.substring(0, lastParamEndLoc.column + lastParamNode.name.length + 2) + fix.message + lineContent.substring(lastParamEndLoc.column + lastParamNode.name.length + 1, lineContent.length)

    fix.range = {
      startLineNumber: fixLineNumber,
      endLineNumber: fixLineNumber,
      startColumn: 0,
      endColumn: error.startColumn + msg.length
    }
    return msg
  }

  async fnWithoutParamsQFMsg(model, nodeAtPosition, fix, error, isOldAST) {
    let fixLineNumber, msg
    if (isOldAST) {
      const location = await this.props.plugin.call('codeParser', 'getLineColumnOfNode', nodeAtPosition)
      fixLineNumber = location.start.line + 1
    } else fixLineNumber = nodeAtPosition.loc.start.line

    const lineContent = model.getLineContent(fixLineNumber)
    const i = lineContent.indexOf('()')
    
    if (fix.id === 5 && lineContent.includes(' view ')) {
      msg = lineContent.replace('view', 'pure')
    } else
      msg = lineContent.substring(0, i + 3) + fix.message + lineContent.substring(i + 3, lineContent.length)
    
    fix.range = {
      startLineNumber: fixLineNumber,
      endLineNumber: fixLineNumber,
      startColumn: 0,
      endColumn: error.startColumn + msg.length
    }
    return msg
  }
}