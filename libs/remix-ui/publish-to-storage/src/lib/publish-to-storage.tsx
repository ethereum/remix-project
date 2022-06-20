import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { RemixUiPublishToStorageProps } from './types' // eslint-disable-line
import { publishToIPFS } from './publishToIPFS'
import { publishToSwarm } from './publishOnSwarm'

export const PublishToStorage = (props: RemixUiPublishToStorageProps) => {
  const { api, storage, contract, resetStorage } = props
  const [modalShown, setModalShown] = useState(false)
  const [state, setState] = useState({
    modal: {
      title: '',
      message: null,
      hide: true,
      okLabel: '',
      okFn: null,
      cancelLabel: '',
      cancelFn: null
    }
  })

  useEffect(() => {
    const storageService = async () => {
      if ((contract.metadata === undefined || contract.metadata.length === 0)) {
        modal('Publish To Storage', 'This contract may be abstract, it may not implement an abstract parent\'s methods completely or it may not invoke an inherited contract\'s constructor correctly.')

      } else {
        if (storage === 'swarm') {
          try {
            const result = await publishToSwarm(contract, api)

            modal(`Published ${contract.name}'s Metadata and Sources`, publishMessage(result.uploaded))
          } catch (err) {
            let parseError = err
            try {
              parseError = JSON.stringify(err)
            } catch (e) {
            }
            modal('Swarm Publish Failed', publishMessageFailed(storage, parseError))
          }
        } else {
          if (!api.config.get('settings/ipfs-url') && !modalShown) {
            modal('IPFS Settings', <div>You have not set your own custom IPFS settings.<br></br>
              <br></br>
              We won’t be providing a public endpoint anymore for publishing your contracts to IPFS.<br></br>Instead of that, 4 options are now available:<br></br>
              <br></br>
              <ul className='pl-3'>
                <li>
                  DEFAULT OPTION:
                  Use the public INFURA node. This will not guarantee your data will persist.
                </li>
                <li>
                  Use your own INFURA IPFS node. This requires a subscription. <a href='https://infura.io/product/ipfs' target={'_blank'}>Learn more</a>
                </li>
                <li>
                  Use any external IPFS which doesn’t require any authentification.
                </li>
                <li>
                  Use your own local ipfs node (which usually runs under http://localhost:5001)
                </li>
              </ul>
              You can update your IPFS settings in the SETTINGS tab.
              <br></br>
              Now the default option will be used.
            </div>, async () => await ipfs(contract, api))
          } else {
            await ipfs(contract, api)
          }
        }
      }
    }

    if (storage) {
      storageService()
    }
  }, [storage])


  const ipfs = async (contract, api) => {
    try {
      const result = await publishToIPFS(contract, api)
      modal(`Published ${contract.name}'s Metadata and Sources`, publishMessage(result.uploaded))
    } catch (err) {
      modal('IPFS Publish Failed', publishMessageFailed(storage, err))
    }
    setModalShown(true)
  }

  const publishMessage = (uploaded) => (
    <span> Metadata and sources of "{contract.name.toLowerCase()}" were published successfully. <br />
      <pre>
        <div>
          {uploaded.map((value, index) => <div key={index}><b>{value.filename}</b> : <pre>{value.output.url}</pre></div>)}
        </div>
      </pre>
    </span>
  )

  const publishMessageFailed = (storage, err) => (
    <span>Failed to publish metadata file and sources to {storage}, please check the {storage} gateways is available. <br />
      {err}
    </span>
  )

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modal: { ...prevState.modal, hide: true, message: null } }
    })
    resetStorage()
  }

  const modal = async (title: string, message: string | JSX.Element, okFn: any = () => { }) => {
    await setState(prevState => {
      return {
        ...prevState,
        modal: {
          ...prevState.modal,
          hide: false,
          message,
          title,
          okFn
        }
      }
    })
  }

  return (
    <ModalDialog
      id={props.id || 'publishToStorage'}
      title={state.modal.title}
      message={state.modal.message}
      hide={state.modal.hide}
      okLabel='OK'
      okFn={state.modal.okFn}
      handleHide={handleHideModal}>
      {(typeof state.modal.message !== 'string') && state.modal.message}
    </ModalDialog>
  )
}

export default PublishToStorage
