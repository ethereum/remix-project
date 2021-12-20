
export interface Modal {
    hide?: boolean
    title: string
    // eslint-disable-next-line no-undef
    message: string | JSX.Element
    okLabel: string
    okFn: () => void
    cancelLabel: string
    cancelFn: () => void
  }