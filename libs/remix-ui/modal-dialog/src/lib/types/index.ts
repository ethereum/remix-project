export interface ModalDialogProps {
  id?: string
  title?: string,
  message?: string,
  ok?: { label: string, fn: () => void },
  cancel: { label: string, fn: () => void },
  modalClass?: string,
  showCancelIcon?: boolean,
  hide: boolean,
  handleHide: (hideState?: boolean) => void,
  children?: React.ReactNode
}
