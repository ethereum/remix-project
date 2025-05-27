import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { AppContext } from '../../context/context'
import { useDialogDispatchers } from '../../context/provider'
import { AppModalCancelTypes } from '../../types'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || [])

interface ManagePreferencesDialogProps {
}

const ManagePreferencesDialog = (props: ManagePreferencesDialogProps) => {
  const { modal } = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(true)

  const message = () => {
    return (
      <>
        <p>
          Manage Preferences 
        </p>
      </>
    )
  }
  
  useEffect(() => {
    if (visible) {
      modal({
        id: 'managePreferencesModal',
        title: <FormattedMessage id="remixApp.managePreferences" />,
        message: message(),
        okLabel: <FormattedMessage id="remixApp.declineCookies" />,
        okFn: () => {},
        cancelLabel: <FormattedMessage id="remixApp.savePreferences" />,
        cancelFn: () => {},
        showCancelIcon: true,
        preventBlur: true
      })
    }
  }, [visible])

  return <></>
}

export default ManagePreferencesDialog
