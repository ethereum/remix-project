import { useReducer } from 'react'
import { modalReducer } from '../reducer/modals'

export const actionTypes = {
  setModal: 'SET_MODAL',
  setToast: 'SET_TOAST'
}

export const setModal = (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
  return {
    type: actionTypes.setModal,
    payload: { message, title, okLabel, okFn, cancelLabel, cancelFn }
  }
}

export const setToast = (toasterMsg: string) => {
  return {
    type: actionTypes.setToast,
    payload: toasterMsg
  }
}

function useModals ({ reducer = modalReducer } = {}) {
  const [{ modals, toasters, focusModal, focusToaster }, dispatch] = useReducer(reducer, {
    modals: [],
    toasters: [],
    focusModal: {
      hide: true,
      title: '',
      message: '',
      okLabel: '',
      okFn: () => {},
      cancelLabel: '',
      cancelFn: () => {}
    },
    focusToaster: ''
  })

  const modal = (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    dispatch(setModal(title, message, okLabel, okFn, cancelLabel, cancelFn))
  }

  const toast = (toasterMsg: string) => {
    dispatch(setToast(toasterMsg))
  }

  return { focusModal, modals, focusToaster, toasters, modal, toast }
}
