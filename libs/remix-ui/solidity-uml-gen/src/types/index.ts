import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react'

export interface ISolidityUmlGen extends ViewPlugin {
    element: HTMLDivElement
    currentFile: string
    svgPayload: string
    updatedSvg: string
    showUmlDiagram(path: string, svgPayload: string): void
    render(): JSX.Element
}