import React from 'react'
import BasicLogo from './BasicLogo'
interface HomeProps {
  verticalIconPlugin: any
}

function Home ({ verticalIconPlugin }: HomeProps) {
  return (
    <div
      className="mt-2 my-1 remixui_homeIcon"
      onClick={async () => await verticalIconPlugin.activateHome()}
      {...{ plugin: 'home'}}
      title="Home"
      data-id="verticalIconsHomeIcon"
      id="verticalIconsHomeIcon"
    >
      <BasicLogo />
    </div>
  )
}

export default Home
