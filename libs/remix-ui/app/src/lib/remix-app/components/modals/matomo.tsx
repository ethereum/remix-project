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
  const { settings, showMatomo, appManager } = useContext(AppContext)
  const { modal } = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(props.hide)

  const message = () => {
    return (
      <>
        <p>
          <FormattedMessage
            id="remixApp.matomoText1"
            values={{
              a: (chunks) => (
                <a href="https://matomo.org" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage id="remixApp.matomoText2" />
        </p>
        <p>
          <FormattedMessage id="remixApp.matomoText3" />
        </p>
        <p>
          <FormattedMessage id="remixApp.matomoText4" />
        </p>
        <p>
          <FormattedMessage
            id="remixApp.matomoText5"
            values={{
              a: (chunks) => (
                <a href="https://medium.com/p/66ef69e14931/" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage id="remixApp.matomoText6" />
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
        cancelLabel: <FormattedMessage id="remixApp.decline" />,
        cancelFn: declineModal,
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
