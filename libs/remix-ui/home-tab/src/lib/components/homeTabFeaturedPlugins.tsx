/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../themeContext'
import { ToggleSwitch } from '@remix-ui/toggle'
import { RenderIf, RenderIfNot } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'
import { HOME_TAB_PLUGIN_LIST } from './constant'
import axios from 'axios'
import { LoadingCard } from './LoaderPlaceholder'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line
interface HomeTabFeaturedPluginsProps {
  plugin: any
}

interface PluginInfo {
  pluginId: string
  pluginTitle: string
  action: {
    type: string
    label: string
    url?: string
    pluginName?: string
    pluginMethod?: string
    pluginArgs?: (string | number | boolean | object | null)[]
  }
  iconClass: string
  maintainedBy: string
  description: string
}

function HomeTabFeaturedPlugins({ plugin }: HomeTabFeaturedPluginsProps) {
  const [activePlugins, setActivePlugins] = useState<string[]>([])
  const [loadingPlugins, setLoadingPlugins] = useState<string[]>([])
  const [pluginList, setPluginList] = useState<{ caption: string, plugins: PluginInfo[] }>({ caption: '', plugins: []})
  const [isLoading, setIsLoading] = useState(true)
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  useEffect(() => {
    async function getPluginList() {
      try {
        setIsLoading(true)
        const response = await axios.get(HOME_TAB_PLUGIN_LIST)

        response.data && setPluginList(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching plugin list:', error)
      }
    }
    getPluginList()

    plugin.on('manager', 'activate', (plugin: { name: string }) => {
      setActivePlugins(activePlugins => [...activePlugins, plugin.name])
    })
  }, [])

  const activateFeaturedPlugin = async (pluginId: string) => {
    setLoadingPlugins([...loadingPlugins, pluginId])
    if (await plugin.appManager.isActive(pluginId)) {
      _paq.push(['trackEvent', 'hometab', 'featuredPluginsToggle', `deactivate-${pluginId}`])
      await plugin.appManager.deactivatePlugin(pluginId)
      setActivePlugins(activePlugins.filter((id) => id !== pluginId))
    } else {
      _paq.push(['trackEvent', 'hometab', 'featuredPluginsToggle', `activate-${pluginId}`])
      await plugin.appManager.activatePlugin([pluginId])
      await plugin.verticalIcons.select(pluginId)
      setActivePlugins([...activePlugins, pluginId])
    }
    setLoadingPlugins(loadingPlugins.filter((id) => id !== pluginId))
  }

  const handleFeaturedPluginActionClick = (pluginInfo: PluginInfo) => {
    _paq.push(['trackEvent', 'hometab', 'featuredPluginsActionClick', pluginInfo.pluginTitle])
    if (pluginInfo.action.type === 'link') {
      window.open(pluginInfo.action.url, '_blank')
    } else if (pluginInfo.action.type === 'methodCall') {
      plugin.call(pluginInfo.action.pluginName, pluginInfo.action.pluginMethod, pluginInfo.action.pluginArgs)
    }
  }

  function PluginCard(pluginInfo: PluginInfo) {
    return (
      <div className="card border h-100">
        <div className="d-flex align-items-center px-2 justify-content-between border-bottom">
          <div className='d-flex align-items-center px-2'>
            <RenderIf condition={loadingPlugins.includes(pluginInfo.pluginId)}>
              <i className="fad fa-spinner fa-spin mr-2"></i>
            </RenderIf>
            <RenderIfNot condition={loadingPlugins.includes(pluginInfo.pluginId)}>
              { pluginInfo.iconClass ? <i className={`${pluginInfo.iconClass} mr-2`}></i> : <i className="fa-solid fa-file-book mr-2"></i> }
            </RenderIfNot>
            <span className="fw-bold" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.pluginTitle}</span>
          </div>
          <ToggleSwitch id={`toggleSwitch-${pluginInfo.pluginId}`} isOn={activePlugins.includes(pluginInfo.pluginId)} onClick={() => activateFeaturedPlugin(pluginInfo.pluginId)} />
        </div>
        <div className="d-flex flex-column justify-content-between h-100">
          <div className="p-3">
            <div className={`text-${(pluginInfo.maintainedBy || '').toLowerCase() === 'remix' ? 'success' : 'dark'} mb-1`}><i className="fa-solid fa-shield-halved mr-2"></i><FormattedMessage id="home.maintainedBy"/> {pluginInfo.maintainedBy || 'Community'}</div>
            <div className="small mb-2" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.description}</div>
          </div>
          <div className="px-3 pb-3">
            <button className="btn btn-light btn-sm w-100 text-decoration-none border" onClick={() => handleFeaturedPluginActionClick(pluginInfo)}>
              <i className="fa-solid fa-book mr-1"></i>{pluginInfo.action.label}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="w-100 align-items-end remixui_featuredplugins_container" id="hTFeaturedPlugins">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 style={{ color: isDark ? 'white' : 'black' }}>{pluginList.caption}</h6>
        <button className="btn btn-secondary btn-md" onClick={() => plugin.call('menuicons', 'select', 'pluginManager')} ><FormattedMessage id="home.exploreAllPlugins"/></button>
      </div>
      <div className="row">
        {
          isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`loading-${index}`} className="col-lg-12 col-xl-6 col-md-6 col-sm-12 mb-4">
                <LoadingCard />
              </div>
            ))
          ) : (
            pluginList.plugins.map((pluginInfo: PluginInfo) => (
              <div className="col-lg-12 col-xl-6 col-md-6 col-sm-12 mb-4 " key={pluginInfo.pluginId}>{ PluginCard(pluginInfo) }</div>
            ))
          )
        }
=======
    <div className="ps-2 w-100 align-items-end remixui_featuredplugins_container" id="hTFeaturedPlugins">
      <label className="" style={{ fontSize: '1.2rem' }}>
        <FormattedMessage id="home.featuredPlugins" />
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
                breakpoint: { max: 4000, min: 3000 },
                items: itemsToShow
              },
              desktop: {
                breakpoint: { max: 3000, min: 1024 },
                items: itemsToShow
              }
            }}
            renderButtonGroupOutside={true}
            ssr={false} // means to render carousel on server-side.
            keyBoardControl={true}
            containerClass="carousel-container"
            deviceType={'desktop'}
            itemClass="w-100"
          >
            <PluginButton
              imgPath="assets/img/contractVerification.webp"
              envID="contractVerificationLogo"
              envText="Contract Verification"
              description={intl.formatMessage({
                id: 'home.contractVerificationDesc',
              })}
              maintainedBy="Remix"
              callback={() => startContractVerification()}
            />
            <PluginButton
              imgPath="assets/img/learnEthLogo.webp"
              envID="learnEthLogo"
              envText="LearnEth Tutorials"
              description={intl.formatMessage({
                id: 'home.learnEthPluginDesc'
              })}
              maintainedBy='Remix'
              callback={() => startLearnEth()}
            />
            <PluginButton
              imgPath="assets/img/staticAnalysis.webp"
              envID="staticAnalysisLogo"
              envText="Solidity Analyzers"
              description={intl.formatMessage({
                id: 'home.codeAnalyizerPluginDesc'
              })}
              maintainedBy='Remix'
              callback={() => startCodeAnalyzer()}
            />
            <PluginButton
              imgPath="assets/img/cookbook.webp"
              envID="cookbookLogo"
              envText="Cookbook"
              description={intl.formatMessage({ id: 'home.cookbookDesc' })}
              maintainedBy="Cookbook"
              callback={() => startCookbook()}
            />
            <PluginButton
              imgPath="assets/img/solidityLogo.webp"
              envID="solidityLogo"
              envText="Solidity"
              description={intl.formatMessage({ id: 'home.solidityPluginDesc' })}
              maintainedBy='Remix'
              callback={() => startSolidity()}
            />
            <PluginButton
              imgPath="assets/img/unitTesting.webp"
              envID="sUTLogo"
              envText="Solidity unit testing"
              description={intl.formatMessage({ id: 'home.unitTestPluginDesc' })}
              maintainedBy='Remix'
              callback={() => startSolidityUnitTesting()}
            />
          </Carousel>
        </ThemeContext.Provider>
>>>>>>> a3fdf118cc (bootstrap 5)
      </div>
    </div>
  )
}

export default HomeTabFeaturedPlugins
