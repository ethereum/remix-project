import React, { useReducer } from 'react'
import { actionTypes } from '../actions/modals'
import { modalReducer } from '../reducer/modals'
import { ModalInitialState } from '../state/modals'
import { ModalTypes } from '../types'
import { AppContext, dispatchModalContext, modalContext } from './context'

export const ModalProvider = ({ children = [], reducer = modalReducer, initialState = ModalInitialState } = {}) => {
  const [{ modals, toasters, focusModal, focusToaster }, dispatch] = useReducer(reducer, initialState)

  const modal = (title: string, message: string | JSX.Element, okLabel: string, okFn: (value?:any) => void, cancelLabel?: string, cancelFn?: () => void, modalType?: ModalTypes, defaultValue?: string) => {
    dispatch({
      type: actionTypes.setModal,
      payload: { title, message, okLabel, okFn, cancelLabel, cancelFn, modalType: modalType || ModalTypes.default, defaultValue: defaultValue }
    })
  }

  const alert = (title: string, message?: string | JSX.Element) => {
    modal(message ? title : 'Alert', message || title, 'OK', null, null, null)
  }

  const handleHideModal = () => {
    dispatch({
      type: actionTypes.handleHideModal,
      payload: null
    })
  }

  const toast = (message: string) => {
    dispatch({
      type: actionTypes.setToast,
      payload: message
    })
  }

  const handleToaster = () => {
    dispatch({
      type: actionTypes.handleToaster,
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
