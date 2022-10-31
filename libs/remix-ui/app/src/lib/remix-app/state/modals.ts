import { ModalState } from '../interface'

export const ModalInitialState: ModalState = {
  modals: [],
  toasters: [],
  focusModal: {
    id: '',
    hide: true,
    title: '',
    message: '',
    validationFn: () => { return { valid: true, message: '' } },
    okLabel: '',
    okFn: () => { },
    cancelLabel: '',
    cancelFn: () => { }
  },
  focusToaster: { message: '', uid: 0 }
}
