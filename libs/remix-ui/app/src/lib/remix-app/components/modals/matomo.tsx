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

interface MatomoDialogProps {
  acceptAllFn: () => void
  managePreferencesFn: () => void
  hide: boolean
}

const MatomoDialog = (props: MatomoDialogProps) => {
  let { settings, showMatomo, appManager } = useContext(AppContext)
  const { modal } = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(props.hide)
  showMatomo = true // remove it before merge

  const message = () => {
    return (
      <>
        <p>
          <FormattedMessage
            id="remixApp.matomoText1"
            values={{
              a: (chunks) => (
                <a href="https://remix-ide.readthedocs.io/en/latest/ai.html" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
            }}
          /><br/>
          <FormattedMessage
            id="remixApp.matomoText2"
            values={{
              a: (chunks) => (
                <a href="https://matomo.org" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
            }}
          />
        </p>
      </>
    )
  }

  useEffect(() => {
    if (visible && showMatomo) {
      modal({
        id: 'matomoModal',
        title: <FormattedMessage id="remixApp.matomoTitle" />,
        message: message(),
        okLabel: <FormattedMessage id="remixApp.accept" />,
        okFn: handleAcceptAllClick,
        cancelLabel: <FormattedMessage id="remixApp.managePreferences" />,
        cancelFn: handleManagePreferencesClick,
        showCancelIcon: true,
        preventBlur: true
      })
    }
  }, [visible])

  const declineModal = async (reason: AppModalCancelTypes) => {
    if (reason === AppModalCancelTypes.click || reason === AppModalCancelTypes.enter) {
      settings.updateMatomoAnalyticsChoice(false)
      // revoke tracking consent
      _paq.push(['forgetConsentGiven'])
      setVisible(false)
    }
  }

  const handleAcceptAllClick = async () => {

    // user has given consent to process their data
    _paq.push(['setConsentGiven'])
    settings.updateMatomoAnalyticsChoice(true)
    setVisible(false)
    props.acceptAllFn()
  }

  const handleManagePreferencesClick = async () => {
    setVisible(false)
    props.managePreferencesFn()
  }

  return <></>
}

export default MatomoDialog
