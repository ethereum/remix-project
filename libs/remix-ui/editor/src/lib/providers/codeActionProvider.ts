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
        model /**ITextModel*/,
        range /**Range*/,
        context /**CodeActionContext*/,
        token /**CancellationToken*/
    ) {

        const actions = context.markers.map(error => {
            const errStrings = Object.keys(fixes)
            const errStr = errStrings.find(es => error.message.includes(es))
            const fix = fixes[errStr]
            return {
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
            };
        });
        return {
            actions: actions,
            dispose: () => {}
        }
    }
}