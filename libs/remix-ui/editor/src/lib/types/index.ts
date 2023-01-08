import { Monaco } from "@monaco-editor/react"
import { IMarkdownString, IPosition, MarkerSeverity } from "monaco-editor"
import React from "react"
import monaco from 'monaco-editor/esm/vs/editor/editor.api'

export type sourceAnnotation = {
  row: number,
  column: number,
  text: string,
  type: 'error' | 'warning' | 'info'
  hide: boolean
  from: string // plugin name
}

export type sourceMarker = {
  position: {
    start: {
      line: number
      column: number
    },
    end: {
      line: number
      column: number
    }
  },
  from: string // plugin name
  hide: boolean
}

export type lineText = {
  position: {
    start: {
      line: number
      column: number
    },
    end: {
      line: number
      column: number
    }
  },
  from?: string // plugin name
  content: string
  className: string
  afterContentClassName: string
  hide: boolean,
  hoverMessage: IMarkdownString | IMarkdownString[]
}

export type errorMarker = {
  message: string
  severity: MarkerSeverity | 'warning' | 'info' | 'error' | 'hint'
  position: {
    start: {
      line: number
      column: number
    },
    end: {
      line: number
      column: number
    }
  },
  file: string
}

export interface EditorUIProps {
  contextualListener: any
  activated: boolean
  themeType: string
  currentFile: string
  isDiff: boolean
  events: {
    onBreakPointAdded: (file: string, line: number) => void
    onBreakPointCleared: (file: string, line: number) => void
    onDidChangeContent: (file: string) => void
    onEditorMounted: () => void
    onDiffEditorMounted: () => void
  }
  plugin: {
    on: (plugin: string, event: string, listener: any) => void
    call: (plugin: string, method: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any) => any
  }
  editorAPI: {
    findMatches: (uri: string, value: string) => any
    getFontSize: () => number,
    getValue: (uri: string) => string
    getCursorPosition: (offset?: boolean) => number | IPosition
    getHoverPosition: (position: IPosition) => number
    addDecoration: (marker: sourceMarker, filePath: string, typeOfDecoration: string) => DecorationsReturn
    clearDecorationsByPlugin: (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => DecorationsReturn
    keepDecorationsFor: (filePath: string, plugin: string, typeOfDecoration: string, registeredDecorations: any, currentDecorations: any) => DecorationsReturn
    addErrorMarker: (errors: errorMarker[], from: string) => void
    clearErrorMarkers: (sources: string[] | {[fileName: string]: any}, from: string) => void
    monacoRef: React.MutableRefObject<Monaco>
    editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor>
    diffEditorRef: React.MutableRefObject<monaco.editor.IStandaloneDiffEditor>
  }
}

export type DecorationsReturn = {
  currentDecorations: Array<string>
  registeredDecorations?: Array<any>
}

export  const defaultEditorValue = `
\t\t\t\t\t\t\t ____    _____   __  __   ___  __  __   ___   ____    _____ 
\t\t\t\t\t\t\t|  _ \\  | ____| |  \\/  | |_ _| \\ \\/ /  |_ _| |  _ \\  | ____|
\t\t\t\t\t\t\t| |_) | |  _|   | |\\/| |  | |   \\  /    | |  | | | | |  _|  
\t\t\t\t\t\t\t|  _ <  | |___  | |  | |  | |   /  \\    | |  | |_| | | |___ 
\t\t\t\t\t\t\t|_| \\_\\ |_____| |_|  |_| |___| /_/\\_\\  |___| |____/  |_____|\n\n
\t\t\t\t\t\t\tKeyboard Shortcuts:\n
\t\t\t\t\t\t\t\tCTRL + S: Compile the current contract\n
\t\t\t\t\t\t\t\tCTRL + Shift + F : Open the File Explorer\n
\t\t\t\t\t\t\t\tCTRL + Shift + A : Open the Plugin Manager\n
\t\t\t\t\t\t\t\tCTRL + SHIFT + S: Compile the current contract & Run an associated script\n
\t\t\t\t\t\t\tEditor Keyboard Shortcuts:\n
\t\t\t\t\t\t\t\tCTRL + Alt + F : Format the code in the current file\n
\t\t\t\t\t\t\tImportant Links:\n
\t\t\t\t\t\t\t\tOfficial website about the Remix Project: https://remix-project.org/\n
\t\t\t\t\t\t\t\tOfficial documentation: https://remix-ide.readthedocs.io/en/latest/\n
\t\t\t\t\t\t\t\tGithub: https://github.com/ethereum/remix-project\n
\t\t\t\t\t\t\t\tGitter: https://gitter.im/ethereum/remix\n
\t\t\t\t\t\t\t\tMedium: https://medium.com/remix-ide\n
\t\t\t\t\t\t\t\tTwitter: https://twitter.com/ethereumremix\n
`