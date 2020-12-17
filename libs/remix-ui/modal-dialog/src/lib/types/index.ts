export interface ModalDialogProps {
  title?: string,
  content?: JSX.Element,
  ok?: {label:string, fn: () => void},
  cancel?: {label:string, fn: () => void},
  focusSelector?: string,
  opts?: {class: string, hideClose?: boolean},
  hide: () => void
}
