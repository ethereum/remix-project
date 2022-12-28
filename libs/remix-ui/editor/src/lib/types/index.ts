import { IMarkdownString, MarkerSeverity } from "monaco-editor"

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