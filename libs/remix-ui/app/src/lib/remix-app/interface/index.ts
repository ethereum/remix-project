import { ModalTypes } from '../types'

export interface AppModal {
    id: string
    hide?: boolean
    title: string
    // eslint-disable-next-line no-undef
    message: string | JSX.Element
    okLabel: string
    okFn?: (value?:any) => void
    cancelLabel: string
    cancelFn?: () => void,
    modalType?: ModalTypes,
    defaultValue?: string
    hideFn?: () => void,
    resolve?: (value?:any) => void
}

export interface AlertModal {
    id: string
    title?: string,
    message: string | JSX.Element,
}

export interface ModalState {
    modals: AppModal[],
    toasters: (string | JSX.Element)[],
    focusModal: AppModal,
    focusToaster: string | JSX.Element
}
