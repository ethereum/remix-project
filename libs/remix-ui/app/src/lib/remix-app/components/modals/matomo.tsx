import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/context'
import { useDialogDispatchers } from '../../context/provider'
const _paq = window._paq = window._paq || []

const MatomoDialog = (props) => {
  const { settings, showMatamo, appManager } = useContext(AppContext)
  const { modal } = useDialogDispatchers()
  const [visible, setVisible] = useState<boolean>(props.hide)

  const message = () => {
    return (<><p>An Opt-in version of <a href="https://matomo.org" target="_blank" rel="noreferrer">Matomo</a>, an open source data analytics platform is being used to improve Remix IDE.</p>
      <p>We realize that our users have sensitive information in their code and that their privacy - your privacy - must be protected.</p>
      <p>All data collected through Matomo is stored on our own server - no data is ever given to third parties.  Our analytics reports are public: <a href="https://matomo.ethereum.org/index.php?module=MultiSites&action=index&idSite=23&period=day&date=yesterday" target="_blank" rel="noreferrer">take a look</a>.</p>
      <p>We do not collect nor store any personally identifiable information (PII).</p>
      <p>For more info, see: <a href="https://medium.com/p/66ef69e14931/" target="_blank" rel="noreferrer">Matomo Analyitcs on Remix iDE</a>.</p>
      <p>You can change your choice in the Settings panel anytime.</p></>)
  }

  useEffect(() => {
    if (visible && showMatamo) {
      modal({ id: 'matomoModal', title: 'Help us to improve Remix IDE', message: message(), okLabel: 'Accept', okFn: handleModalOkClick, cancelLabel: 'Decline', cancelFn: declineModal })
    }
  }, [visible])

  const declineModal = async () => {
    settings.updateMatomoAnalyticsChoice(false)
    _paq.push(['optUserOut'])
    appManager.call('walkthrough', 'start')
    setVisible(false)
  }

  const handleModalOkClick = async () => {
    _paq.push(['forgetUserOptOut'])
    // @TODO remove next line when https://github.com/matomo-org/matomo/commit/9e10a150585522ca30ecdd275007a882a70c6df5 is used
    document.cookie = 'mtm_consent_removed=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    settings.updateMatomoAnalyticsChoice(true)
    appManager.call('walkthrough', 'start')
    setVisible(false)
  }

  return (<></>)
}

export default MatomoDialog
