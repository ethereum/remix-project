/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import WorkspaceTemplate from './workspaceTemplate'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || [] //eslint-disable-line

interface  HomeTabGetStartedProps {
  plugin: any
}

function HomeTabGetStarted ({plugin}: HomeTabGetStartedProps) {
  const themeFilter = useContext(ThemeContext)

  const createWorkspace = async (templateName) => {
    await plugin.appManager.activatePlugin('filePanel')
    const timeStamp = Date.now()
    await plugin.call('filePanel', 'createWorkspace', templateName + "_" + timeStamp, templateName)
    await plugin.call('filePanel', 'setWorkspace', templateName + "_" + timeStamp)
    console.log("templateName ", templateName)
    plugin.verticalIcons.select('filePanel')
    _paq.push(['trackEvent', 'homeGetStarted', templateName])
  }

  return (
    <div className="pl-2" id="hTGetStartedSection">
      <label style={{fontSize: "1.2rem"}}>Get Started<span className="ml-2" style={{ opacity: "0.7"}}>- Project Templates</span></label>
      <div className="w-100 d-flex flex-column">
        <ThemeContext.Provider value={ themeFilter }>
          <Carousel 
            focusOnSelect
            customButtonGroup={<CustomNavButtons next={undefined} previous={undefined} goToSlide={undefined} />}
            arrows={false}
            swipeable={false}
            draggable={true}
            showDots={false}
            responsive={{ desktop: { breakpoint: { max: 3000, min: 1024 }, items: 5} }}
            renderButtonGroupOutside={true}
            ssr={true} // means to render carousel on server-side.
            keyBoardControl={true}
            containerClass="carousel-container"
            deviceType={"desktop"}
            itemClass="w-100"
          >
            <WorkspaceTemplate gsID="starkNetLogo" workspaceTitle="Blank" description="Create an empty workspace." callback={() => createWorkspace("blank")} />
            <WorkspaceTemplate gsID="solhintLogo" workspaceTitle="Remix Default" description="Create a workspace with sample files." callback={() => createWorkspace("remixDefault")} />
            <WorkspaceTemplate gsID="sourcifyLogo" workspaceTitle="OpenZeppelin ERC20" description="Create an ERC20 token by importing OpenZeppelin library." callback={() => createWorkspace("ozerc20")} />
            <WorkspaceTemplate gsID="sUTLogo" workspaceTitle="OpenZeppelin ERC721" description="Create an NFT token by importing OpenZeppelin library." callback={() => createWorkspace("ozerc721")} />
            <WorkspaceTemplate gsID="sUTLogo" workspaceTitle="0xProject ERC20" description="Create an ERC20 token by importing 0xProject contract." callback={() => createWorkspace("zeroxErc20")} />
            <WorkspaceTemplate gsID="solidityLogo" workspaceTitle="Add a workspace" description="Create and configure a workspace manually." callback={() => createWorkspace("")} />
          </Carousel>
        </ThemeContext.Provider>
      </div>    </div>
  )
}

export default HomeTabGetStarted
