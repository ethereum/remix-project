import { Monaco } from '@monaco-editor/react'
import monaco from '../../types/monaco'
import { EditorUIProps } from '../remix-ui-editor'
import { default as fixesList } from './quickfixes'

export class RemixCodeActionProvider implements monaco.languages.CodeActionProvider {
  props: EditorUIProps
  monaco: Monaco
  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
  }

  async provideCodeActions(
    model: monaco.editor.ITextModel,
    range: monaco.Range,
    context: monaco.languages.CodeActionContext,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.CodeActionList> {
    const actions: monaco.languages.CodeAction[] = []
    for (const error of context.markers) {
      let fixes: Record<string, any>[], msg: string
      let isOldAST: boolean = false
      const errStrings: string[] = Object.keys(fixesList)
      const errStr: string = errStrings.find((es) => error.message.includes(es))
      if (errStr) {
        fixes = fixesList[errStr]
        const cursorPosition: number = this.props.editorAPI.getHoverPosition({
          lineNumber: error.startLineNumber,
          column: error.startColumn
        })
        const nodeAtPosition = await this.props.plugin.call('codeParser', 'definitionAtPosition', cursorPosition)
        // Check if a function is hovered
        if (nodeAtPosition && nodeAtPosition.nodeType === 'FunctionDefinition') {
          // Identify type of AST node
          if (nodeAtPosition.parameters && !Array.isArray(nodeAtPosition.parameters) && Array.isArray(nodeAtPosition.parameters.parameters)) isOldAST = true
          const paramNodes = isOldAST ? nodeAtPosition.parameters.parameters : nodeAtPosition.parameters
          for (const fix of fixes) {
            msg = paramNodes.length
              ? await this.fixForMethodWithParams(model, paramNodes, fix, error, isOldAST)
              : await this.fixForMethodWithoutParams(model, nodeAtPosition, fix, error, isOldAST)
            this.addQuickFix(actions, error, model.uri, {
              id: fix.id,
              title: fix.title,
              range: fix.range,
              text: msg
            })
          }
        } else {
          for (const fix of fixes) {
            if (fix && nodeAtPosition && fix.nodeType && fix.nodeType !== nodeAtPosition.nodeType) continue
            switch (fix.id) {
            case 2: {
              // To add specific pragma based on error
              const startIndex = error.message.indexOf('pragma')
              const endIndex = error.message.indexOf(';')
              const msg = error.message.substring(startIndex, endIndex + 1)
              this.addQuickFix(actions, error, model.uri, {
                title: fix.title,
                range: fix.range,
                text: msg
              })
              break
            }
            case 8: {
              // To add `abstract` in the contract
              const lineContent: string = model.getValueInRange(error)
              this.addQuickFix(actions, error, model.uri, {
                title: fix.title,
                range: error,
                text: fix.message + lineContent
              })
              break
            }
            case 9.1:
            case 9.2:
            case 10.1:
            case 10.2:
            case 10.3:
            case 11.1:
            case 11.2: {
              // To add data location in constructor params, function params and variables
              const lineContent: string = model.getValueInRange(error)
              const words = lineContent.split(' ')
              this.addQuickFix(actions, error, model.uri, {
                title: fix.title,
                range: error,
                text: words[0] + fix.message + words[1]
              })
              break
            }
            default:
              this.addQuickFix(actions, error, model.uri, {
                title: fix.title,
                range: fix.range || error,
                text: fix.message
              })
            }
          }
        }
      }
    }

    return {
      actions: actions,
      dispose: () => {}
    }
  }

  /**
   * Add quick fix to code actions
   * @param actions code actions array
   * @param error editor error object
   * @param uri model URI
   * @param fix details of quick fix to apply
   */
  addQuickFix(actions: monaco.languages.CodeAction[], error: monaco.editor.IMarkerData, uri: monaco.Uri, fix: Record<string, any>) {
    const { id, title, range, text } = fix
    actions.push({
      title,
      diagnostics: [error],
      kind: 'quickfix',
      edit: {
        edits: [
          {
            resource: uri,
            textEdit: { range, text },
            versionId: undefined
          }
        ]
      },
      isPreferred: true
    })
  }

  /**
   * Returns message for various quick fixes related to a method with parameters
   * @param model Model
   * @param paramNodes function parameters AST nodes
   * @param fix details of quick fix to apply
   * @param error editor error object
   * @param isOldAST true, if AST node contains legacy fields
   * @returns message to be placed as quick fix
   */
  async fixForMethodWithParams(
    model: monaco.editor.ITextModel,
    paramNodes: Record<string, any>[],
    fix: Record<string, any>,
    error: monaco.editor.IMarkerData,
    isOldAST: boolean
  ): Promise<string> {
    let lastParamEndLoc: Record<string, any>, fixLineNumber: number, msg: string
    // Get last function parameter node
    const lastParamNode: Record<string, any> = paramNodes[paramNodes.length - 1]
    if (isOldAST) {
      const location: Record<string, any> = await this.props.plugin.call('codeParser', 'getLineColumnOfNode', lastParamNode)
      // Get end location of last function parameter, it returns end column of parameter name
      lastParamEndLoc = location.end
      fixLineNumber = lastParamEndLoc.line + 1
    } else {
      // Get end location of last function parameter, it returns start column of parameter name
      lastParamEndLoc = lastParamNode.loc.end
      fixLineNumber = lastParamEndLoc.line
    }
    const lineContent: string = model.getLineContent(fixLineNumber)
    if (fix.id === 5 && lineContent.includes(' view ')) msg = lineContent.replace('view', 'pure')
    else if (isOldAST) msg = lineContent.substring(0, lastParamEndLoc.column + 2) + fix.message + lineContent.substring(lastParamEndLoc.column + 1, lineContent.length)
    else
      msg =
        lineContent.substring(0, lastParamEndLoc.column + lastParamNode.name.length + 2) +
        fix.message +
        lineContent.substring(lastParamEndLoc.column + lastParamNode.name.length + 1, lineContent.length)

    fix.range = {
      startLineNumber: fixLineNumber,
      endLineNumber: fixLineNumber,
      startColumn: 0,
      endColumn: error.startColumn + msg.length
    }
    return msg
  }

  /**
   * Returns message for various quick fixes related to a method without parameters
   * @param model Model
   * @param paramNodes function parameters AST nodes
   * @param fix details of quick fix to apply
   * @param error editor error object
   * @param isOldAST true, if AST node contains legacy fields
   * @returns message to be placed as quick fix
   */
  async fixForMethodWithoutParams(
    model: monaco.editor.ITextModel,
    nodeAtPosition: Record<string, any>,
    fix: Record<string, any>,
    error: monaco.editor.IMarkerData,
    isOldAST: boolean
  ): Promise<string> {
    let fixLineNumber: number, msg: string
    if (isOldAST) {
      const location: Record<string, any> = await this.props.plugin.call('codeParser', 'getLineColumnOfNode', nodeAtPosition)
      fixLineNumber = location.start.line + 1
    } else fixLineNumber = nodeAtPosition.loc.start.line

    const lineContent: string = model.getLineContent(fixLineNumber)
    const i: number = lineContent.indexOf('()')

    if (fix.id === 5 && lineContent.includes(' view ')) {
      msg = lineContent.replace('view', 'pure')
    } else msg = lineContent.substring(0, i + 3) + fix.message + lineContent.substring(i + 3, lineContent.length)

    fix.range = {
      startLineNumber: fixLineNumber,
      endLineNumber: fixLineNumber,
      startColumn: 0,
      endColumn: error.startColumn + msg.length
    }
    return msg
  }
}
