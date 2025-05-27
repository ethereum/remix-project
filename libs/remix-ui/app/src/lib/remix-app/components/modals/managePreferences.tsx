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
        <div data-id="remixAI" className='justify-content-between align-items-center d-flex'>
          <div>
            <h6><FormattedMessage id="remixApp.mpOp1Title" /></h6>
            <p className='form-check-label'><FormattedMessage id="remixApp.mpOp1Details" /></p>
            <p className='mt-1'><FormattedMessage
              id="remixApp.mpOp1Link"
              values={{
                a: (chunks) => (
                  <a className="text-primary" href="https://matomo.org" target="_blank" rel="noreferrer">
                    {chunks}
                  </a>
                ),
              }}
            /></p>
          </div>
          <div>
            <button
              data-id="remixAIswitch"
              id='remixAIswitch'
              className="btn text-ai"
              onClick={() => {}}
            >
              <i className="fas fa-toggle-on fa-2xl"></i>
            </button>
          </div>
        </div>
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
