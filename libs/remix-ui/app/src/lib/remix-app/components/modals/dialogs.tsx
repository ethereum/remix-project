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
      <Toaster message={focusToaster.message} uid={focusToaster.uid} handleHide={handleToaster} />
    </>)
}
export default AppDialogs
