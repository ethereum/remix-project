export interface ModalDialogProps {
  id?: string
  title?: string,
  message?: string,
  okLabel?: string,
  okFn?: () => void,
  cancelLabel?: string,
  cancelFn?: () => void,
  modalClass?: string,
  showCancelIcon?: boolean,
  hide: boolean,
  handleHide: (hideState?: boolean) => void,
  children?: React.ReactNode
}
