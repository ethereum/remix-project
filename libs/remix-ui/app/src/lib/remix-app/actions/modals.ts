import { AppModal } from '../interface'

type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
      ? {
          type: Key;
        }
      : {
          type: Key;
          payload: M[Key];
        }
}

export const enum modalActionTypes {
  setModal = 'SET_MODAL',
  setToast = 'SET_TOAST',
  handleHideModal = 'HANDLE_HIDE_MODAL',
  handleToaster = 'HANDLE_HIDE_TOAST'
}

type ModalPayload = {
  [modalActionTypes.setModal]: AppModal
  [modalActionTypes.handleHideModal]: any
  [modalActionTypes.setToast]: string | JSX.Element
  [modalActionTypes.handleToaster]: any
}

export type ModalAction = ActionMap<ModalPayload>[keyof ActionMap<
  ModalPayload
>]
