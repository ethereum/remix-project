import React from 'react'
import { AlertModal, AppModal } from '../interface'
import { ModalInitialState } from '../state/modals'
import { ModalTypes } from '../types'

const AppContext = React.createContext<{layout: any, settings: any, showMatamo: boolean, appManager: any, modal: any}>(null)

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
