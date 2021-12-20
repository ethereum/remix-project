import { actionTypes } from '../state/modals'
import { Modal } from '../types'

interface Action {
  type: string
  payload: any
}

export interface ModalState {
  modals: Modal[],
  toasters: string[],
  focusModal: Modal,
  focusToaster: string
}

const ModalInitialState: ModalState = {
  modals: [],
  toasters: [],
  focusModal: {
    hide: true,
    title: '',
    message: '',
    okLabel: '',
    okFn: () => {},
    cancelLabel: '',
    cancelFn: () => {}
  },
  focusToaster: ''
}

export const modalReducer = (state: ModalState = ModalInitialState, action: Action) => {
  switch (action.type) {
    case actionTypes.setModal:
      state.modals.push(action.payload)
      return { ...state }
  }
  return {
    modals: state.modals,
    toasters: state.toasters,
    focusModal: state.focusModal,
    focusToaster: state.focusToaster
  }
}
