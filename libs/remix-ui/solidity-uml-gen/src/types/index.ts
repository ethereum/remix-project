import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react'

export interface ISolidityUmlGen extends ViewPlugin {
    element: HTMLDivElement
    currentFile: string
    svgPayload: string
    updatedSvg: string
    showUmlDiagram(path: string, svgPayload: string): void
    updateComponent(state: any): JSX.Element
    setDispatch(dispatch: React.Dispatch<any>): void

    render(): JSX.Element
}