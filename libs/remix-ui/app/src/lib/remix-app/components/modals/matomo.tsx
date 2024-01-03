import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from '../../context/context'
import {useDialogDispatchers} from '../../context/provider'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || [])

interface MatomoDialogProps {
  okFn: () => void,
  hide: boolean
}

const MatomoDialog = (props: MatomoDialogProps) => {
  const {settings, showMatamo, appManager} = useContext(AppContext)
  const {modal} = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(props.hide)

  const message = () => {
    return (
      <>
        <p>
          An Opt-in version of{' '}
          <a href="https://matomo.org" target="_blank" rel="noreferrer">
            Matomo
          </a>
          , an open source data analytics platform is being used to improve Remix IDE.
        </p>
        <p>We realize that our users have sensitive information in their code and that their privacy - your privacy - must be protected.</p>
        <p>
          All data collected through Matomo is stored on our own server - no data is ever given to third parties.
        </p>
        <p>We do not collect nor store any personally identifiable information (PII).</p>
        <p>
          For more info, see:{' '}
          <a href="https://medium.com/p/66ef69e14931/" target="_blank" rel="noreferrer">
            Matomo Analyitcs on Remix iDE
          </a>
          .
        </p>
        <p>You can change your choice in the Settings panel anytime.</p>
      </>
    )
  }

  useEffect(() => {
    if (visible && showMatamo) {
      modal({
        id: 'matomoModal',
        title: 'Help us to improve Remix IDE',
        message: message(),
        okLabel: 'Accept',
        okFn: handleModalOkClick,
        cancelLabel: 'Decline',
        cancelFn: declineModal
      })
    }
  }, [visible])

  const declineModal = async () => {
    settings.updateMatomoAnalyticsChoice(false)
    // revoke tracking consent
    _paq.push(['forgetConsentGiven']);
    setVisible(false)
  }

  const handleModalOkClick = async () => {
    // user has given consent to process their data
    _paq.push(['setConsentGiven']);
    settings.updateMatomoAnalyticsChoice(true)
    setVisible(false)
    props.okFn()
  }

  return <></>
}

export default MatomoDialog
