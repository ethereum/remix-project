import React from 'react'
import {AlertModal, AppModal} from '../interface'
import {ModalInitialState} from '../state/modals'
import { Plugin } from '@remixproject/engine'

export type appProviderContextType = {
  settings: any,
  showMatamo: boolean
  appManager: any
  modal: any
  layout: any
  platform: appPlatformType
}

export type appPlatformType = 'web' | 'desktop'


export const AppContext = React.createContext<appProviderContextType>(null)

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
