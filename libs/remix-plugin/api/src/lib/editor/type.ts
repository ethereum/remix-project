export interface HighlightPosition {
  start: {
    line: number
    column: number
  }
  end: {
    line: number
    column: number
  }
}

export interface HighLightOptions {
  focus: boolean
}

export interface Annotation {
    row: number;
    column: number;
    text: string;
    type: "error" | "warning" | "info";
}
