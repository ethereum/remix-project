import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { RemixUiPublishToStorageProps } from './types'

import './css/publish-to-storage.css'

export const PublishToStorage = (props: RemixUiPublishToStorageProps) => {
  const { storage, fileProvider, fileManager, contract } = props
  const [state, setState] = useState({
    contract: null,
    modal: {
      title: '',
      message: null,
      hide: true,
      ok: {
        label: '',
        fn: null
      },
      cancel: {
        label: '',
        fn: null
      }
    }
  })

  useEffect(() => {
    if (storage && storage === 'swarm') {

    }
  }, [storage])

  useEffect(() => {
    if (contract && (contract.metadata === undefined || contract.metadata.length === 0)) {
      modal('Publish To Storage', 'This contract may be abstract, may not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.', {
        label: 'OK',
        fn: () => {}
      }, null)
    }
  }, [contract])

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modal: { ...prevState.modal, hide: true, message: null } }
    })
  }

  const modal = async (title: string, message: string | JSX.Element, ok: { label: string, fn: () => void }, cancel: { label: string, fn: () => void }) => {
    await setState(prevState => {
      return {
        ...prevState,
        modal: {
          ...prevState.modal,
          hide: false,
          message,
          title,
          ok,
          cancel,
          handleHide: handleHideModal
        }
      }
    })
  }

  return (
    <>
      <ModalDialog
        id='publishToStorageModalDialog'
        title={ state.modal.title }
        message={ state.modal.message }
        hide={ state.modal.hide }
        ok={ state.modal.ok }
        cancel={ state.modal.cancel }
        handleHide={ handleHideModal }>
        { (typeof state.modal.message !== 'string') && state.modal.message }
      </ModalDialog>
      <div>
        <h1>Welcome to remix-ui-publish-to-storage!</h1>
      </div>
    </>
  )
}

export default PublishToStorage
