import React from 'react'
import { ModalInitialState } from '../state/modals'
import { ModalTypes } from '../types'

export const AppContext = React.createContext(null)

export const dispatchModalContext = React.createContext({
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: (value?:any) => void, cancelLabel?: string, cancelFn?: () => void, modalType?: ModalTypes, defaultValue?: string) => { },
  toast: (message: string) => {},
  alert: (title: string, message?: string | JSX.Element) => {},
  handleHideModal: () => { },
  handleToaster: () => {}
})

export const modalContext = React.createContext(ModalInitialState)
