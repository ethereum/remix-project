import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog'
import { RemixUiPublishToStorageProps } from './types'

import './css/remix-ui-publish-to-storage.css'

export const RemixUiPublishToStorage = (props: RemixUiPublishToStorageProps) => {
  const { storage, fileProvider, fileManager, contract } = props
  const [state, setState] = useState({
    contract: null
  })

  useEffect(() => {

  }, [state.contract])

  return (
    <>
      <ModalDialog/>
      <div>
        <h1>Welcome to remix-ui-publish-to-storage!</h1>
      </div>
    </>
  )
}

export default RemixUiPublishToStorage
