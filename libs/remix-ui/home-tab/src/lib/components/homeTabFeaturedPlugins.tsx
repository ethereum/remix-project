/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import PluginButton from './pluginButton'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || [] //eslint-disable-line

interface  HomeTabFeaturedPluginsProps {
  plugin: any
}

function HomeTabFeaturedPlugins ({plugin}: HomeTabFeaturedPluginsProps) {

  const themeFilter = useContext(ThemeContext)
  const carouselRef = useRef(null)

  // Todo doesn't work
  useEffect(() => {
      window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleScroll = (e) => {
  }

  const startSolidity = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'udapp', 'solidityStaticAnalysis', 'solidityUnitTesting'])
    plugin.verticalIcons.select('solidity')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solidity'])
  }
  const startStarkNet = async () => {
    await plugin.appManager.activatePlugin('starkNet_compiler')
    plugin.verticalIcons.select('starkNet_compiler')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'starkNet_compiler'])
  }
  const startSolhint = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'solhint'])
    plugin.verticalIcons.select('solhint')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solhint'])
  }
  const startSourceVerify = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'sourcify'])
    plugin.verticalIcons.select('sourcify')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'sourcify'])
  }
  const startSolidityUnitTesting = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'solidityUnitTesting'])
    plugin.verticalIcons.select('solidityUnitTesting')
    _paq.push(['trackEvent', 'pluginManager', 'userActivate', 'solidityUnitTesting'])
  }

  return (
    <div className="pl-2 w-100" id="hTFeaturedPlugins">
      <label className="" style={{fontSize: "1.2rem"}}><FormattedMessage id='home.featuredPlugins' defaultMessage='Featured Plugins' /></label>
      <div className="w-100 d-flex flex-column">
        <ThemeContext.Provider value={ themeFilter }>
          <Carousel
            ref={carouselRef}
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
            <PluginButton
              imgPath="assets/img/solidityLogo.webp"
              envID="solidityLogo"
              envText="Solidity"
              description="Compile, test and analyse smart contract."
              remixMaintained={true}
              callback={() => startSolidity()}
            />
            <PluginButton
              imgPath="assets/img/starkNetLogo.webp"
              envID="starkNetLogo"
              envText="StarkNet"
              description="Compile and deploy contracts with Cairo, a native language for StarkNet."
              l2={true}
              callback={() => startStarkNet()}
            />
            <PluginButton
              imgPath="assets/img/solhintLogo.webp"
              envID="solhintLogo" envText="Solhint linter"
              description="Solhint is an open source project for linting Solidity code."
              callback={() => startSolhint()}
            />
            <PluginButton
              imgPath="assets/img/sourcifyNewLogo.webp"
              envID="sourcifyLogo"
              envText="Sourcify"
              description="Solidity contract and metadata verification service."
              callback={() => startSourceVerify()}
            />
            <PluginButton
              imgPath="assets/img/unitTesting.webp"
              envID="sUTLogo"
              envText="Solidity unit testing"
              description="Write and run unit tests for your contracts in Solidity."
              callback={() => startSolidityUnitTesting()}
            />
          </Carousel>
        </ThemeContext.Provider>
      </div>
    </div>
  )
}

export default HomeTabFeaturedPlugins
