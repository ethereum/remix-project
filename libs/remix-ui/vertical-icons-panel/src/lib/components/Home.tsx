/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import React, { ReactNode } from 'react'
import BasicLogo from './BasicLogo'
interface HomeProps {
  verticalIconPlugin: VerticalIcons
}

function Home ({ verticalIconPlugin }: HomeProps) {
  return (
    <div
      className="pl-1 mt-2 remixui_homeIcon"
      onClick={async () => await verticalIconPlugin.activateHome()}
      // @ts-ignore
      plugin="home"
      title="Home"
      data-id="verticalIconsHomeIcon"
      id="verticalIconsHomeIcon"
    >
      <BasicLogo />
    </div>
  )
}

export default Home
