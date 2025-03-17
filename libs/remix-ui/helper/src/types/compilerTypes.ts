export type CompileOptionsProps = {
    setCircuitAutoCompile: (value: boolean) => void,
    setCircuitHideWarnings: (value: boolean) => void,
    autoCompile: boolean,
    hideWarnings: boolean
  }

export type FeedbackAlertProps = {
    message: string,
    askGPT: () => void
  }

export type CompilerFeedbackProps = {
    feedback: string | CompilerReport[],
    filePathToId: Record<string, string>,
    openErrorLocation: (report: CompilerReport) => void,
    hideWarnings: boolean,
    askGPT: (report: CompilerReport) => void
  }

export type CompilerReport = {
    type: "Error" | "Bug" | "Help" | "Note" | "Warning" | "Unknown",
    message: string,
    labels: {
      style: "Primary" | "Secondary" | "Unknown",
      file_id: string,
      range: {
        start: string,
        end: string
      },
      message: string
    }[],
    notes: string[]
  }
