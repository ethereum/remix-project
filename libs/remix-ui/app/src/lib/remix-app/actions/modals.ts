import { AppModal } from '../interface'

export type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
      ? {
          type: Key;
        }
      : {
          type: Key;
          payload: M[Key];
        }
}

export const enum actionTypes {
  setModal = 'SET_MODAL',
  setToast = 'SET_TOAST',
  handleHideModal = 'HANDLE_HIDE_MODAL',
  handleToaster = 'HANDLE_HIDE_TOAST'
}

type ModalPayload = {
  [actionTypes.setModal]: AppModal
  [actionTypes.handleHideModal]: any
  [actionTypes.setToast]: string
  [actionTypes.handleToaster]: any
}

export type ModalAction = ActionMap<ModalPayload>[keyof ActionMap<
  ModalPayload
>]
