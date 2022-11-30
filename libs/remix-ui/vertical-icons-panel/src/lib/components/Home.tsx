import { CustomTooltip } from '@remix-ui/helper'
import React from 'react'
import BasicLogo from './BasicLogo'
interface HomeProps {
  verticalIconPlugin: any
}

function Home ({ verticalIconPlugin }: HomeProps) {
  return (
    <CustomTooltip
      placement="right"
      tooltipText={"Home"}
    >
      <div
        className="mt-2 my-1 remixui_homeIcon"
        onClick={async () => await verticalIconPlugin.activateHome()}
        {...{ plugin: 'home'}}
        data-id="verticalIconsHomeIcon"
        id="verticalIconsHomeIcon"
      >
        <BasicLogo />
      </div>
    </CustomTooltip>
  )
}

export default Home
