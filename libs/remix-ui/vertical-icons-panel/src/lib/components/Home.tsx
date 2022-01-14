import React from 'react'
import BasicLogo from './BasicLogo'
interface HomeProps {
  verticalIconPlugin: any
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
