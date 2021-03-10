import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { RemixUiPublishToStorageProps } from './types'
import { publishToIPFS } from './publishToIPFS'
import { publishToSwarm } from './publishOnSwarm'

import './css/publish-to-storage.css'

export const PublishToStorage = (props: RemixUiPublishToStorageProps) => {
  const { storage, fileProvider, fileManager, contract } = props
  const [state, setState] = useState({
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
    const storageService = async () => {
      if ((contract.metadata === undefined || contract.metadata.length === 0)) {
        modal('Publish To Storage', 'This contract may be abstract, may not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.', {
          label: 'OK',
          fn: () => {}
        }, null)
      } else {
        if (storage === 'swarm') {
          try {
            const result = await publishToSwarm(contract, fileManager)

            modal(`Published ${contract.name}'s Metadata`, publishMessage(result.uploaded), {
              label: 'OK',
              fn: () => {}
            }, null)
            // triggered each time there's a new verified publish (means hash correspond)
            fileProvider.addExternal('swarm/' + result.item.hash, result.item.content)
          } catch (err) {
            try {
              err = JSON.stringify(err)
            } catch (e) {}
            modal(`Swarm Publish Failed`, publishMessageFailed(storage, err), {
              label: 'OK',
              fn: () => {}
            }, null)
          }
        } else {
          try {
            const result = await publishToIPFS(contract, fileManager)

            modal(`Published ${contract.name}'s Metadata`, publishMessage(result.uploaded), {
              label: 'OK',
              fn: () => {}
            }, null)
            // triggered each time there's a new verified publish (means hash correspond)
            fileProvider.addExternal('swarm/' + result.item.hash, result.item.content)
          } catch (err) {
            modal(`Swarm Publish Failed`, publishMessageFailed(storage, err), {
              label: 'OK',
              fn: () => {}
            }, null)
        }
      }
    }
  }

  if (contract) {
    storageService()
  }
}, [contract])

  const publishMessage = (uploaded) => {
    return (
      <span> Metadata of {contract.name.toLowerCase()} was published successfully. <br />
        <pre>
          <div>
            { uploaded.map((value) => {
              <div><b>{ value.filename }</b> : <pre>{ value.output.url }</pre></div>
            }) }
          </div>
        </pre>
      </span>
    )
  }

  const publishMessageFailed = (storage, err) => {
    return (
      <span>Failed to publish metadata file to { storage }, please check the { storage } gateways is available. <br />
        {err} 
      </span>
    )
  }

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
  )
}

export default PublishToStorage
