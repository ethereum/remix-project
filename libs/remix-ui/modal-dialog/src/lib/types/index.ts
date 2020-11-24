/* eslint-disable */
export interface ModalDialogProps {
  title?: string,
  content?: JSX.Element,
  ok?: {label:string, fn: Function},
  cancel?: {label:string, fn: Function},
  focusSelector?: string,
  opts?: {class: string, hideClose?: boolean},
  hide?: boolean
}