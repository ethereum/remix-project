import React from 'react'
import { AlertModal, AppModal } from '../interface'
import { ModalInitialState } from '../state/modals'

export type appProviderContextType = {
  settings: any,
  showMatamo: boolean,
  showEnter: boolean,
  appManager: any
  modal: any
}

export enum appPlatformTypes {
  web = 'web',
  desktop = 'desktop'
}

export const AppContext = React.createContext<appProviderContextType>(null)
export const onLineContext = React.createContext<boolean>(null)
export const platformContext = React.createContext<appPlatformTypes>(null)

export interface dispatchModalInterface {
  modal: (data: AppModal) => void
  toast: (message: string | JSX.Element) => void
  alert: (data: AlertModal) => void
  handleHideModal: () => void
  handleToaster: () => void
}

export const dispatchModalContext = React.createContext<dispatchModalInterface>({
  modal: (data: AppModal) => {},
  toast: (message: string | JSX.Element) => {},
  alert: (data: AlertModal) => {},
  handleHideModal: () => {},
  handleToaster: () => {}
})

export const modalContext = React.createContext(ModalInitialState)
