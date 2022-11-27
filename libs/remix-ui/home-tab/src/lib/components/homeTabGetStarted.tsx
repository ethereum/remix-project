/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useContext } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { ThemeContext} from '../themeContext'
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
  const carouselRef = useRef<any>({})
  const carouselRefDiv = useRef(null)
  const intl = useIntl()

  useEffect(() => {
    document.addEventListener("wheel", handleScroll)
    return () => {
      document.removeEventListener("wheel", handleScroll)
    }
  }, [])

  function isDescendant(parent, child) {
    let node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  const handleScroll = (e) => {
    if (isDescendant(carouselRefDiv.current, e.target)) {
      e.stopPropagation()
      let nextSlide = 0
      if (e.wheelDelta < 0) {
        nextSlide = carouselRef.current.state.currentSlide + 1;
        if (Math.abs(carouselRef.current.state.transform) >= carouselRef.current.containerRef.current.scrollWidth - carouselRef.current.state.containerWidth) return
        carouselRef.current.goToSlide(nextSlide)
      } else {
        nextSlide = carouselRef.current.state.currentSlide - 1;
        if (nextSlide < 0) nextSlide = 0
        carouselRef.current.goToSlide(nextSlide)
      }
    }
  }

  const createWorkspace = async (templateName) => {
    await plugin.appManager.activatePlugin('filePanel')
    const timeStamp = Date.now()
    await plugin.call('filePanel', 'createWorkspace', templateName + "_" + timeStamp, templateName)
    await plugin.call('filePanel', 'setWorkspace', templateName + "_" + timeStamp)
    plugin.verticalIcons.select('filePanel')
    _paq.push(['trackEvent', 'hometab', 'homeGetStarted', templateName])
  }

  return (
    <div className="pl-2" id="hTGetStartedSection">
      <label style={{fontSize: "1.2rem"}}>
        <span className="mr-2" style={{fontWeight: "bold"}}>
          <FormattedMessage id="home.getStarted" defaultMessage="Get Started" />
        </span>
        - <FormattedMessage id="home.projectTemplates" defaultMessage="Project Templates" />
      </label>
      <div ref={carouselRefDiv} className="w-100 d-flex flex-column">
        <ThemeContext.Provider value={ themeFilter }>
          <Carousel
            ref={carouselRef}
            focusOnSelect={true}
            customButtonGroup={
              <CustomNavButtons next={undefined} previous={undefined} goToSlide={undefined} parent={carouselRef} />
            }
            arrows={false}
            swipeable={false}
            draggable={true}
            showDots={false}
            responsive={
              {
                superLargeDesktop: {
                  breakpoint: { max: 4000, min: 3000 },
                  items: 5
                },
                desktop: {
                  breakpoint: { max: 3000, min: 1024 },
                  items: 5,
                  partialVisibilityGutter: 0
                }
              }
            }
            renderButtonGroupOutside={true}
            ssr={true} // means to render carousel on server-side.
            keyBoardControl={true}
            containerClass="carousel-container"
            deviceType={"desktop"}
            itemClass="w-100"
          >
            <WorkspaceTemplate
              gsID="starkNetLogo"
              workspaceTitle="Blank"
              description={intl.formatMessage({ id: 'home.blankTemplateDesc', defaultMessage: "Create an empty workspace." })}
              callback={() => createWorkspace("blank")} />
            <WorkspaceTemplate
              gsID="solhintLogo"
              workspaceTitle="Remix Default"
              description={intl.formatMessage({ id: 'home.remixDefaultTemplateDesc', defaultMessage: "Create a workspace with sample files." })}
              callback={() => createWorkspace("remixDefault")} />
            <WorkspaceTemplate
              gsID="sourcifyLogo"
              workspaceTitle="OpenZeppelin ERC20"
              description={intl.formatMessage({ id: 'home.ozerc20TemplateDesc', defaultMessage: "Create an ERC20 token by importing OpenZeppelin library." })}
              callback={() => createWorkspace("ozerc20")} />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="OpenZeppelin ERC721"
              description={intl.formatMessage({ id: 'home.ozerc721TemplateDesc', defaultMessage: "Create an NFT token by importing OpenZeppelin library." })}
              callback={() => createWorkspace("ozerc721")} />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="0xProject ERC20"
              description={intl.formatMessage({ id: 'home.zeroxErc20TemplateDesc', defaultMessage: "Create an ERC20 token by importing 0xProject contract." })}
              callback={() => createWorkspace("zeroxErc20")} />
          </Carousel>
        </ThemeContext.Provider>
      </div>
    </div>
  )
}

export default HomeTabGetStarted
