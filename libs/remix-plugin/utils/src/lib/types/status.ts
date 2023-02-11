export interface Status {
  /** Display an icon or number */
  key: number | 'edited' | 'succeed' | 'loading' | 'failed' | 'none'
  /** Bootstrap css color */
  type?: 'success' | 'info' | 'warning' | 'error'
  /** Describe the status on mouseover */
  title?: string
}

/* tslint:disable:interface-over-type-literal */
export type StatusEvents = {
  statusChanged: (status: Status) => void
}