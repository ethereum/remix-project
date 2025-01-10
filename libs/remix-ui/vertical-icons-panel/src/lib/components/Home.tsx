import { CustomTooltip } from '@remix-ui/helper'
import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import BasicLogo from './BasicLogo'
import { AppContext } from '@remix-ui/app'
import { desktopConnextionType } from '@remix-api'
interface HomeProps {
  verticalIconPlugin: any
}

function Home({ verticalIconPlugin }: HomeProps) {
  const appContext = useContext(AppContext)
  return (
    <CustomTooltip placement="right" tooltipText={<FormattedMessage id='home.home' />}>
      <div
        className="mt-2 my-1 remixui_homeIcon"
        onClick={async () => {
          if (appContext.appState.connectedToDesktop === desktopConnextionType.disabled) await verticalIconPlugin.activateHome()
        }}
        {...{ plugin: 'home' }}
        data-id="verticalIconsHomeIcon"
        id="verticalIconsHomeIcon"
      >
        <BasicLogo />
      </div>
    </CustomTooltip>
  )
}

export default Home
