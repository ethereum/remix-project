import { GitHubUser } from '@remix-api'
import { ModalTypes } from '../types'

export type ValidationResult = {
    valid: boolean,
    message?: string
}

export interface AppModal {
    id: string
    timestamp?: number
    hide?: boolean
    title: string | JSX.Element
    validationFn?: (value: string) => ValidationResult
    // eslint-disable-next-line no-undef
    message: string | JSX.Element
    okLabel: string | JSX.Element
    okFn?: (value?:any) => void
    cancelLabel?: string | JSX.Element
    cancelFn?: () => void,
    modalType?: ModalTypes,
    modalParentClass?: string
    defaultValue?: string
    hideFn?: () => void,
    resolve?: (value?:any) => void,
    next?: () => void,
    data?: any
}

export interface AlertModal {
    id: string
    title?: string,
    message: string | JSX.Element,
}

export interface ModalState {
    modals: AppModal[],
    toasters: {message: (string | JSX.Element), timestamp: number }[],
    focusModal: AppModal,
    focusToaster: {message: (string | JSX.Element), timestamp: number }
}

export interface forceChoiceModal {
  id: string
  title?: string,
  message: string | JSX.Element,
}

export interface AppState {
    gitHubUser: GitHubUser
}

