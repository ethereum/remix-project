import React, { useEffect } from 'react'
import { useDialogDispatchers, useDialogs } from '../../context/provider'
import { Toaster } from '@remix-ui/toaster'
import ModalWrapper from './modal-wrapper'
import { ModalTypes } from '../../types'

const AppDialogs = () => {
  const { modal, toast, alert, handleHideModal, handleToaster } = useDialogDispatchers()
  const { focusModal, focusToaster } = useDialogs()

  const ok = (returnedValue) => {
    console.log('ok', returnedValue)
  }

  useEffect(() => {
    modal('test', 'Enter gist url', 'yes', ok, 'cancel', () => { }, ModalTypes.prompt, 'wss://remix.ethereum.org:8545')
    toast('test toast')
    // alert('fat error')
  }, [])

  return (
    <>
      <ModalWrapper {...focusModal } handleHide={handleHideModal}></ModalWrapper>
      <Toaster message={focusToaster} handleHide={handleToaster} />
    </>)
}
export default AppDialogs
