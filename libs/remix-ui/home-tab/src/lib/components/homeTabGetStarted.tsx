/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useContext } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { TEMPLATE_NAMES,TEMPLATE_METADATA } from '@remix-ui/workspace'
import { ThemeContext } from '../themeContext'
import Carousel from 'react-multi-carousel'
import WorkspaceTemplate from './workspaceTemplate'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'
import { appPlatformTypes, platformContext } from '@remix-ui/app'
import { CustomTooltip } from '@remix-ui/helper'

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line
interface HomeTabGetStartedProps {
  plugin: any
}

type WorkspaceTemplate = {
  gsID: string
  workspaceTitle: string
  description: string
  projectLogo: string
  templateName: string
}

const workspaceTemplates: WorkspaceTemplate[] = [
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'Playground',
    description: 'Create a new project using this template.',
    projectLogo: 'assets/img/remixverticaltextLogo.png',
    templateName: 'remixDefault'
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'Circom',
    description: 'Create a new ZK Project with Circom using this template.',
    projectLogo: 'assets/img/circom.webp',
    templateName: ''
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'Uniswap',
    description: 'Create a new MultiSig wallet using this template.',
    projectLogo: 'assets/img/gnosissafeLogo.png',
    templateName: ''
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'ERC20',
    description: 'Create a new ERC20 token using this template.',
    projectLogo: 'assets/img/oxprojectLogo.png',
    templateName: ''
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'NFT / ERC721',
    description: 'Create a new ERC721 token using this template.',
    projectLogo: 'assets/img/openzeppelinLogo.png',
    templateName: ''
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'MultiSig',
    description: 'Create a new MultiSig wallet using this template.',
    projectLogo: 'assets/img/gnosissafeLogo.png',
    templateName: ''
  },
]

function HomeTabGetStarted({plugin}: HomeTabGetStartedProps) {
  const platform = useContext(platformContext)
  const themeFilter = useContext(ThemeContext)
  const intl = useIntl()
  const carouselRef = useRef<any>({})
  const carouselRefDiv = useRef(null)

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

    if (platform === appPlatformTypes.desktop){
      await plugin.call('remix-templates', 'loadTemplateInNewWindow', templateName)
      return
    }

    let templateDisplayName = TEMPLATE_NAMES[templateName]
    const metadata = TEMPLATE_METADATA[templateName]
    if (metadata) {
      if (metadata.type === 'git') {
        await plugin.call('dGitProvider', 'clone', { url: metadata.url, branch: metadata.branch }, templateDisplayName)
      } else if (metadata && metadata.type === 'plugin') {
        await plugin.appManager.activatePlugin('filePanel')
        templateDisplayName = await plugin.call('filePanel', 'getAvailableWorkspaceName', templateDisplayName)
        await plugin.call('filePanel', 'createWorkspace', templateDisplayName, 'blank')
        await plugin.call('filePanel', 'setWorkspace', templateDisplayName)
        plugin.verticalIcons.select('filePanel')
        await plugin.call(metadata.name, metadata.endpoint, ...metadata.params)
      }
    } else {
      await plugin.appManager.activatePlugin('filePanel')
      templateDisplayName = await plugin.call('filePanel', 'getAvailableWorkspaceName', templateDisplayName)
      await plugin.call('filePanel', 'createWorkspace', templateDisplayName, templateName)
      await plugin.call('filePanel', 'setWorkspace', templateDisplayName)
      plugin.verticalIcons.select('filePanel')
    }
    _paq.push(['trackEvent', 'hometab', 'homeGetStarted', templateName])
  }

  return (
    <div className="pl-2" id="hTGetStartedSection">
      <label className="pt-3" style={{fontSize: '1.2rem'}}>
        <FormattedMessage id="home.projectTemplates" />
      </label>
      <div ref={carouselRefDiv} className="w-100 d-flex flex-column">
        <ThemeContext.Provider value={themeFilter}>
          {/* <Carousel
            ref={carouselRef}
            focusOnSelect={true}
            customButtonGroup={<CustomNavButtons next={undefined} previous={undefined} goToSlide={undefined} parent={carouselRef} />}
            arrows={false}
            swipeable={false}
            draggable={true}
            showDots={false}
            responsive={{
              superLargeDesktop: {
                breakpoint: { max: 4000, min: 3000 },
                items: 5
              },
              desktop: {
                breakpoint: { max: 3000, min: 1024 },
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
              workspaceTitle="MultiSig"
              description={
                intl.formatMessage({ id: 'home.gnosisSafeMultisigTemplateDesc' })
              }
              projectLogo="assets/img/gnosissafeLogo.png"
              callback={() => createWorkspace("gnosisSafeMultisig")}
            />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="ERC20"
              description={
                intl.formatMessage({ id: 'home.zeroxErc20TemplateDesc' })
              }
              projectLogo="assets/img/oxprojectLogo.png"
              callback={() => createWorkspace("zeroxErc20")}
            />
            <WorkspaceTemplate
              gsID="sourcifyLogo"
              workspaceTitle="ERC20"
              description={intl.formatMessage({ id: 'home.ozerc20TemplateDesc' })}
              projectLogo="assets/img/openzeppelinLogo.png"
              callback={() => createWorkspace('ozerc20')}
            />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="ERC721"
              description={intl.formatMessage({
                id: 'home.ozerc721TemplateDesc'
              })}
              projectLogo="assets/img/openzeppelinLogo.png"
              callback={() => createWorkspace("ozerc721")}
            />
            <WorkspaceTemplate
              gsID="sUTLogo"
              workspaceTitle="ERC1155"
              description={intl.formatMessage({
                id: 'home.ozerc1155TemplateDesc'
              })}
              projectLogo="assets/img/openzeppelinLogo.png"
              callback={() => createWorkspace("ozerc1155")}
            />
            <WorkspaceTemplate
              gsID="solhintLogo"
              workspaceTitle="Basic"
              description={intl.formatMessage({
                id: 'home.remixDefaultTemplateDesc'
              })}
              projectLogo="assets/img/remixverticaltextLogo.png"
              callback={() => createWorkspace("remixDefault")}
            />
          </Carousel> */}
          <div className="pt-2">
            <div className="d-flex flex-row align-items-center mb-3 flex-nowrap">
              {workspaceTemplates.slice(0, 3).map((template, index) => (
                <CustomTooltip tooltipText={template.description} tooltipId={template.gsID} tooltipClasses="text-nowrap" tooltipTextClasses="border bg-light text-dark p-1 pr-3" placement="top-start">
                  <button key={index} className={index === 0 ? "btn btn-primary border p-2 text-nowrap mr-3" : index === workspaceTemplates.length - 1 ? "btn border p-2 text-nowrap mr-2" : "btn border p-2 text-nowrap mr-3"}>{template.workspaceTitle}</button>
                </CustomTooltip>
              ))}
            </div>
            <div className="d-flex flex-row align-items-center mb-3 flex-nowrap">
              {workspaceTemplates.slice(3, workspaceTemplates.length).map((template, index) => (
                <CustomTooltip tooltipText={template.description} tooltipId={template.gsID} tooltipClasses="text-nowrap" tooltipTextClasses="border bg-light text-dark p-1 pr-3" placement="bottom-start">
                  <button
                    key={index}
                    className={"btn border p-2 text-nowrap mr-3"}
                    onClick={() => {
                      createWorkspace(template.templateName)
                    }}
                  >
                    {template.workspaceTitle}
                  </button>
                </CustomTooltip>
              ))}
            </div>
          </div>
        </ThemeContext.Provider>
      </div>
    </div>
  )
}

export default HomeTabGetStarted

// (descriptor: MessageDescriptor, values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>, opts?: Options) => string

// (descriptor: any, values?: any, opts?: any) => string
