import React from 'react'
import { useDialogDispatchers, useDialogs } from '../../context/provider'
import { Toaster } from '@remix-ui/toaster'
import ModalWrapper from './modal-wrapper'

const AppDialogs = () => {
  const { handleHideModal, handleToaster } = useDialogDispatchers()
  const { focusModal, focusToaster } = useDialogs()

  return (
    <>
      <ModalWrapper {...focusModal} handleHide={handleHideModal}></ModalWrapper>
      <Toaster message={focusToaster} handleHide={handleToaster} />
    </>)
}
export default AppDialogs
