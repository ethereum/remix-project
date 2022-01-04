import React from 'react'
import { AlertModal, AppModal } from '../interface'
import { ModalInitialState } from '../state/modals'
import { ModalTypes } from '../types'

export const AppContext = React.createContext<any>(null)

export interface dispatchModalInterface {
  modal: (data: AppModal) => void
  toast: (message: string) => void
  alert: (data: AlertModal) => void
  handleHideModal: () => void,
  handleToaster: () => void
}

export const dispatchModalContext = React.createContext<dispatchModalInterface>({
  modal: (data: AppModal) => { },
  toast: (message: string) => {},
  alert: (data: AlertModal) => {},
  handleHideModal: () => {},
  handleToaster: () => {}
})

export const modalContext = React.createContext(ModalInitialState)
