import { ModalTypes } from '../types'

export interface AppModal {
    hide?: boolean
    title: string
    // eslint-disable-next-line no-undef
    message: string | JSX.Element
    okLabel: string
    okFn: (value?:any) => void
    cancelLabel: string
    cancelFn: () => void,
    modalType?: ModalTypes,
    defaultValue?: string
}

export interface ModalState {
    modals: AppModal[],
    toasters: string[],
    focusModal: AppModal,
    focusToaster: string
}
