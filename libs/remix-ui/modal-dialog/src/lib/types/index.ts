/* eslint-disable no-undef */
export interface ModalDialogProps {
  id: string
  timestamp?: number,
  title?: string,
  message?: string | JSX.Element,
  okLabel?: string,
  okFn?: (value?:any) => void,
  cancelLabel?: string,
  cancelFn?: () => void,
  modalClass?: string,
  showCancelIcon?: boolean,
  hide?: boolean,
  handleHide: (hideState?: boolean) => void,
  children?: React.ReactNode,
  resolve?: (value?:any) => void,
  next?: () => void,
  data?: any
}
