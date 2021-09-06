import React from 'react'
interface HomeProps {
  verticalIconPlugin: any
}

function Home ({ verticalIconPlugin }: HomeProps) {
  return (
    <div
      className="m-1 mt-2 homeIcon"
      onClick={async () => {
        await verticalIconPlugin.appManager.activatePlugin('home')
        this.call('tabs', 'focus', 'home')
      }}
      title="Home"
      data-id="verticalIconsHomeIcon"
      id="verticalIconsHomeIcon"
    >
      { verticalIconPlugin.logoShow() }
    </div>
  )
}

export default Home
