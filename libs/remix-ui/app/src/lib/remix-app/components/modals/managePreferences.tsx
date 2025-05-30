import React, { useContext, useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useDialogDispatchers } from '../../context/provider'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || [])

interface ManagePreferencesDialogProps {
}

const ManagePreferencesSwitcher = (prop: {
  setParentState: (state: any) => void
}) => {
  const [remixAISwitch, setRemixAISwitch] = useState(true)
  const [matPerfSwitch, setMatPerfSwitch] = useState(true)
  

  useEffect(() => {
    prop.setParentState({
      remixAISwitch,
      matPerfSwitch
    })
  }, [remixAISwitch, matPerfSwitch])

  return (
      <>
        <div data-id="matomoAnonAnalytics" className='justify-content-between d-flex'>
          <div className='mt-2'>
            <h6 className='text-secondary'><FormattedMessage id="remixApp.mpOp1Title" /></h6>
            <p className='form-check-label text-secondary'><FormattedMessage id="remixApp.mpOp1Details" /></p>
          </div>
          <div>
            <button
              data-id="matomoAnonAnalyticsSwitch"
              id='matomoAnonAnalyticsSwitch'
              className="btn text-ai"
              disabled
            >
              <i className="fas fa-toggle-on fa-2xl"></i>
            </button>
          </div>
        </div>
        <div data-id="matomoPerfAnalytics" className='justify-content-between d-flex'>
          <div className='mt-3'>
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
              data-id="matomoPerfAnalyticsSwitch"
              id='matomoPerfAnalyticsSwitch'
              className="btn text-ai mt-1"
              onClick={() => setMatPerfSwitch(!matPerfSwitch)}
            >
              { matPerfSwitch ? <i className="fas fa-toggle-on fa-2xl"></i> : <i className="fas fa-toggle-off fa-2xl"></i> }
            </button>
          </div>
        </div>
        <div data-id="remixAI" className='justify-content-between d-flex'>
          <div className='mt-2'>
            <h6><FormattedMessage id="remixApp.mpOp3Title" /></h6>
            <p className='form-check-label'><FormattedMessage id="remixApp.mpOp3Details" /></p>
            <p className='mt-1'><FormattedMessage
              id="remixApp.mpOp3Link"
              values={{
                a: (chunks) => (
                  <a className="text-primary" href="https://remix-ide.readthedocs.io/en/latest/ai.html" target="_blank" rel="noreferrer">
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
              onClick={() => setRemixAISwitch(!remixAISwitch)}
            >
              { remixAISwitch ? <i className="fas fa-toggle-on fa-2xl"></i> : <i className="fas fa-toggle-off fa-2xl"></i> }
            </button>
          </div>
        </div>
      </>
    )
}

const ManagePreferencesDialog = (props: ManagePreferencesDialogProps) => {
  const { modal } = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(true)
  let switcherState = useRef<Record<string, any>>(null)
  
  useEffect(() => {
    if (visible) {
      modal({
        id: 'managePreferencesModal',
        title: <FormattedMessage id="remixApp.managePreferences" />,
        message: <ManagePreferencesSwitcher setParentState={(state)=>{
          switcherState.current = state
        }} />,
        okLabel: <FormattedMessage id="remixApp.savePreferences" />,
        okFn: savePreferences,
        showCancelIcon: true,
        preventBlur: true
      })
    }
  }, [visible])

  const savePreferences = async () => {
    console.log('switcherState--->', switcherState.current)
  }

  return <></>
}

export default ManagePreferencesDialog
