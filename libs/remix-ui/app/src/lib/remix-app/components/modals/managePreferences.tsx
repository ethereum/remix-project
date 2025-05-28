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
        <div data-id="remixAI" className='justify-content-between d-flex'>
          <div className='mt-2'>
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
              data-id="remixAISwitch"
              id='remixAISwitch'
              className="btn text-ai"
              onClick={() => {}}
            >
              <i className="fas fa-toggle-on fa-2xl"></i>
            </button>
          </div>
        </div>
        <div data-id="matomoAnonAnalytics" className='justify-content-between d-flex'>
          <div className='mt-2'>
            <h6><FormattedMessage id="remixApp.mpOp2Title" /></h6>
            <p className='form-check-label'><FormattedMessage id="remixApp.mpOp2Details" /></p>
            <p className='mt-1'><FormattedMessage
              id="remixApp.mpOp2Link"
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
              data-id="matomoAnonAnalyticsSwitch"
              id='matomoAnonAnalyticsSwitch'
              className="btn text-ai"
              onClick={() => {}}
            >
              <i className="fas fa-toggle-off fa-2xl"></i>
            </button>
          </div>
        </div>
        <div data-id="matomoPerfAnalytics" className='justify-content-between d-flex'>
          <div className='mt-2'>
            <h6 className='text-secondary'><FormattedMessage id="remixApp.mpOp3Title" /></h6>
            <p className='form-check-label text-secondary'><FormattedMessage id="remixApp.mpOp3Details" /></p>
          </div>
          <div>
            <button
              data-id="matomoPerfAnalyticsSwitch"
              id='matomoPerfAnalyticsSwitch'
              className="btn text-secondary"
              onClick={() => {}}
            >
              <i className="fas fa-toggle-off fa-2xl"></i>
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
