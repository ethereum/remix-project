import { ViewPlugin } from '@remixproject/engine-web'
import { customAction } from '@remixproject/plugin-api'
import React from 'react'

export interface ISolidityUmlGen extends ViewPlugin {
    element: HTMLDivElement
    currentFile: string
    svgPayload: string
    updatedSvg: string
    currentlySelectedTheme: string
    themeName: string
    themeDark: string
    loading: boolean
    themeCollection: ThemeSummary[]
    activeTheme: ThemeSummary
    showUmlDiagram(path: string, svgPayload: string): void
    updateComponent(state: any): JSX.Element
    setDispatch(dispatch: React.Dispatch<any>): void
    mangleSvgPayload(svgPayload: string) : Promise<string>
    generateCustomAction(action: customAction): Promise<void>
    flattenContract (source: any, filePath: string, data: any): Promise<string>
    hideSpinner(): void
    renderComponent (): void
    triggerGenerateUml: boolean
    render(): JSX.Element
}

export type ThemeQualityType = { name: string, quality: 'light' | 'dark', url: string }

export type ThemeSummary = { themeName: string, backgroundColor: string, textColor?: string,
shapeColor?: string, fillColor?: string }