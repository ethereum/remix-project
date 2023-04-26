/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect, useRef, useContext} from 'react'
import {useIntl, FormattedMessage} from 'react-intl'
import {TEMPLATE_NAMES} from '@remix-ui/workspace'
import {ThemeContext} from '../themeContext'
import Carousel from 'react-multi-carousel'
import WorkspaceTemplate from './workspaceTemplate'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line
interface HomeTabGetStartedProps {
  plugin: any
}

function HomeTabGetStarted({plugin}: HomeTabGetStartedProps) {
  const themeFilter = useContext(ThemeContext)
  const carouselRef = useRef<any>({})
  const carouselRefDiv = useRef(null)
  const intl = useIntl()

  useEffect(() => {
    document.addEventListener('wheel', handleScroll)
    return () => {
      document.removeEventListener('wheel', handleScroll)
    }
  }, [])

  function isDescendant(parent, child) {
    let node = child.parentNode
    while (node != null) {
      if (node === parent) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  const handleScroll = (e) => {
    if (isDescendant(carouselRefDiv.current, e.target)) {
      e.stopPropagation()
      let nextSlide = 0
      if (e.wheelDelta < 0) {
        nextSlide = carouselRef.current.state.currentSlide + 1
        if (Math.abs(carouselRef.current.state.transform) >= carouselRef.current.containerRef.current.scrollWidth - carouselRef.current.state.containerWidth) return
        carouselRef.current.goToSlide(nextSlide)
      } else {
        nextSlide = carouselRef.current.state.currentSlide - 1
        if (nextSlide < 0) nextSlide = 0
        carouselRef.current.goToSlide(nextSlide)
      }
    }
  }

  const createWorkspace = async (templateName) => {
    await plugin.appManager.activatePlugin('filePanel')
    const timeStamp = Date.now()
    let templateDisplayName = TEMPLATE_NAMES[templateName]
    templateDisplayName = await plugin.call('filePanel', 'getAvailableWorkspaceName', templateDisplayName)
    await plugin.call('filePanel', 'createWorkspace', templateDisplayName, templateName)
    await plugin.call('filePanel', 'setWorkspace', templateDisplayName)
    plugin.verticalIcons.select('filePanel')
    _paq.push(['trackEvent', 'hometab', 'homeGetStarted', templateName])
  }

  return (
    <div className="pl-2" id="hTGetStartedSection">
      <label style={{fontSize: '1.2rem'}}>
        <span className="mr-2">
          <FormattedMessage id="home.getStarted" />
        </span>
        - <FormattedMessage id="home.projectTemplates" />
      </label>
      <div ref={carouselRefDiv} className="w-100 d-flex flex-column">
        <ThemeContext.Provider value={themeFilter}>
          <Carousel
            ref={carouselRef}
            focusOnSelect={true}
            customButtonGroup={<CustomNavButtons next={undefined} previous={undefined} goToSlide={undefined} parent={carouselRef} />}
            arrows={false}
            swipeable={false}
            draggable={true}
            showDots={false}
            responsive={{
              superLargeDesktop: {
                breakpoint: {max: 4000, min: 3000},
                items: 5
              },
              desktop: {
                breakpoint: {max: 3000, min: 1024},
                items: 5,
                partialVisibilityGutter: 0
              }
            }}
            renderButtonGroupOutside={true}
            ssr={true} // means to render carousel on server-side.
            keyBoardControl={true}
            containerClass="carousel-container"
            deviceType={'desktop'}
            itemClass="w-100"
          >
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="Gnosis Safe MultiSig"
              description={
                intl.formatMessage({ id: 'home.gnosisSafeMultisigTemplateDesc' })
              }
              callback={() => createWorkspace("gnosisSafeMultisig")}
            />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="0xProject ERC20"
              description={
                intl.formatMessage({ id: 'home.zeroxErc20TemplateDesc' })
              }
              callback={() => createWorkspace("zeroxErc20")}
            />
            <WorkspaceTemplate
              gsID="sourcifyLogo"
              workspaceTitle="OpenZeppelin ERC20"
              description={intl.formatMessage({id: 'home.ozerc20TemplateDesc'})}
              callback={() => createWorkspace('ozerc20')}
            />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="OpenZeppelin ERC721"
              description={intl.formatMessage({
                id: 'home.ozerc721TemplateDesc'
              })}
              callback={() => createWorkspace("ozerc721")}
            />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="OpenZeppelin ERC1155"
              description={intl.formatMessage({
                id: 'home.ozerc1155TemplateDesc'
              })}
              callback={() => createWorkspace("ozerc1155")}
            />
            <WorkspaceTemplate
              gsID="solhintLogo"
              workspaceTitle="Remix Basic"
              description={intl.formatMessage({
                id: 'home.remixDefaultTemplateDesc'
              })}
              callback={() => createWorkspace("remixDefault")}
            />
          </Carousel>
        </ThemeContext.Provider>
      </div>
    </div>
  )
}

export default HomeTabGetStarted
