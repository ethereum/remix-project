import { Monaco } from "@monaco-editor/react"
import monaco from "../../types/monaco"
import { EditorUIProps } from "../remix-ui-editor"

export class RemixCodeActionProvider implements monaco.languages.CodeActionProvider {
    props: EditorUIProps
    monaco: Monaco
    constructor(props: any, monaco: any) {
        this.props = props
        this.monaco = monaco
    }

    async provideCodeActions (
        model /**ITextModel*/,
        range /**Range*/,
        context /**CodeActionContext*/,
        token /**CancellationToken*/
    ) {

        const actions = context.markers.map(error => {
          console.log('error------>', error)
            return {
                title: `Example quick fix`,
                diagnostics: [error],
                kind: "quickfix",
                edit: {
                    edits: [
                        {
                            resource: model.uri,
                            edits: [
                                {
                                    range: error,
                                    text: "This text replaces the text with the error"
                                }
                            ]
                        }
                    ]
                },
                isPreferred: true
            };
        });
        return {
            actions: actions,
            dispose: () => {}
        }
    }
}