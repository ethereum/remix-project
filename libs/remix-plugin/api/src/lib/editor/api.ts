import { HighlightPosition, Annotation } from './type'
import { StatusEvents } from '@remixproject/plugin-utils'
import { HighLightOptions } from '@remixproject/plugin-api'

export interface IEditor {
  events: StatusEvents
  methods: {
    highlight(
      position: HighlightPosition,
      filePath: string,
      hexColor: string,
      opt?: HighLightOptions
    ): void
    discardHighlight(): void
    discardHighlightAt(line: number, filePath: string): void
    addAnnotation(annotation: Annotation): void
    clearAnnotations(): void
    gotoLine(line:number, col:number): void
  }

}
