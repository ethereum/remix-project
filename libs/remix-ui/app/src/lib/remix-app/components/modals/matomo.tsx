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
  okFn: () => void
  hide: boolean
}

const MatomoDialog = (props: MatomoDialogProps) => {
  let { settings, showMatomo, appManager } = useContext(AppContext)
  const { modal } = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(props.hide)

  const message = () => {
    return (
      <>
        <p>
          <FormattedMessage id="remixApp.matomoText1" /><br/>
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
        okFn: handleModalOkClick,
        cancelLabel: <FormattedMessage id="remixApp.managePreferences" />,
        cancelFn: declineModal,
        showCancelIcon: false,
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

  const handleModalOkClick = async () => {

    // user has given consent to process their data
    _paq.push(['setConsentGiven'])
    settings.updateMatomoAnalyticsChoice(true)
    setVisible(false)
    props.okFn()
  }

  return <></>
}

export default MatomoDialog
