import { ModalState } from '../interface'

export const ModalInitialState: ModalState = {
  modals: [],
  toasters: [],
  focusModal: {
    id: '',
    hide: true,
    title: '',
    message: '',
    okLabel: '',
    okFn: () => { },
    cancelLabel: '',
    cancelFn: () => { }
  },
  focusToaster: ''
}
