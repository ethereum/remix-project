import { monacoTypes } from ".."

export type lineText = {
    position: {
      start: {
        line: number
        column: number
      }
      end: {
        line: number
        column: number
      }
    }
    from?: string // plugin name
    content: string
    className: string
    afterContentClassName: string
    hide: boolean
    hoverMessage: monacoTypes.IMarkdownString | monacoTypes.IMarkdownString[]
  }