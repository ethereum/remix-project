import React, { useReducer } from 'react'
import { modalActionTypes } from '../actions/modals'
import { AlertModal, AppModal } from '../interface'
import { modalReducer } from '../reducer/modals'
import { ModalInitialState } from '../state/modals'
import { ModalTypes } from '../types'
import { AppContext, dispatchModalContext, modalContext } from './context'

export const ModalProvider = ({ children = [], reducer = modalReducer, initialState = ModalInitialState } = {}) => {
  const [{ modals, toasters, focusModal, focusToaster }, dispatch] = useReducer(reducer, initialState)

  const onNextFn = async () => {
    dispatch({
      type: modalActionTypes.processQueue
    })
  }

  const modal = (modalData: AppModal) => {
    const { id, title, message, okLabel, okFn, cancelLabel, cancelFn, modalType, defaultValue, hideFn, data } = modalData
    return new Promise((resolve, reject) => {
      dispatch({
        type: modalActionTypes.setModal,
        payload: { id, title, message, okLabel, okFn, cancelLabel, cancelFn, modalType: modalType || ModalTypes.default, defaultValue: defaultValue, hideFn, resolve, next: onNextFn, data }
      })
    })
  }

  const alert = (modalData: AlertModal) => {
    return modal({ id: modalData.id, title: modalData.title || 'Alert', message: modalData.message || modalData.title, okLabel: 'OK', okFn: (value?:any) => {}, cancelLabel: '', cancelFn: () => {} })
  }

  const handleHideModal = () => {
    dispatch({
      type: modalActionTypes.handleHideModal,
      payload: null
    })
  }

  const toast = (message: string | JSX.Element) => {
    dispatch({
      type: modalActionTypes.setToast,
      payload: message
    })
  }

  const handleToaster = () => {
    dispatch({
      type: modalActionTypes.handleToaster,
      payload: null
    })
  }

  return (<dispatchModalContext.Provider value={{ modal, toast, alert, handleHideModal, handleToaster }}>
    <modalContext.Provider value={{ modals, toasters, focusModal, focusToaster }}>
      {children}
    </modalContext.Provider>
  </dispatchModalContext.Provider>)
}

export const AppProvider = ({ children = [], value = {} } = {}) => {
  return <AppContext.Provider value={value}>
    <ModalProvider>{children}</ModalProvider>
  </AppContext.Provider>
}

export const useDialogs = () => {
  return React.useContext(modalContext)
}

export const useDialogDispatchers = () => {
  return React.useContext(dispatchModalContext)
}
