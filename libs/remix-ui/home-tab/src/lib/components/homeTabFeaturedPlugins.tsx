/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { ThemeContext } from '../themeContext'
import { ToggleSwitch } from '@remix-ui/toggle'
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
  imgPath: string
  envID: string
  envText: string
  descriptionId: string
  maintainedBy: string
  documentationUrl: string,
  iconClass: string
}

const featuredPlugins: PluginInfo[] = [
  {
    imgPath: 'assets/img/contractVerification.webp',
    envID: 'contractVerificationLogo',
    envText: 'Contract Verification',
    descriptionId: 'home.contractVerificationDesc',
    maintainedBy: 'Remix',
    documentationUrl: 'https://remix-ide.readthedocs.io/en/latest/contract_verification.html',
    iconClass: 'fa-solid fa-file-contract'
  },
  {
    imgPath: 'assets/img/learnEthLogo.webp',
    envID: 'learnEthLogo',
    envText: 'LearnEth Tutorials',
    descriptionId: 'home.learnEthPluginDesc',
    maintainedBy: 'Remix',
    documentationUrl: 'https://remix-ide.readthedocs.io/en/latest/learneth.html',
    iconClass: 'fa-solid fa-book'
  },
  {
    imgPath: 'assets/img/staticAnalysis.webp',
    envID: 'staticAnalysisLogo',
    envText: 'Solidity Analyzers',
    descriptionId: 'home.codeAnalyizerPluginDesc',
    maintainedBy: 'Remix',
    documentationUrl: 'https://remix-ide.readthedocs.io/en/latest/solidity_analyzers.html',
    iconClass: 'fa-solid fa-file-code'
  },
  {
    imgPath: 'assets/img/cookbook.webp',
    envID: 'cookbookLogo',
    envText: 'Cookbook',
    descriptionId: 'home.cookbookDesc',
    maintainedBy: 'Cookbook',
    documentationUrl: 'https://remix-ide.readthedocs.io/en/latest/cookbook.html',
    iconClass: 'fa-solid fa-book'
  }
]

function HomeTabFeaturedPlugins({ plugin }: HomeTabFeaturedPluginsProps) {
  const intl = useIntl()
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  const startSolidity = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'udapp', 'solidityStaticAnalysis', 'solidityUnitTesting'])
    plugin.verticalIcons.select('solidity')
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', 'solidity'])
  }
  const startCodeAnalyzer = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'solidityStaticAnalysis'])
    plugin.verticalIcons.select('solidityStaticAnalysis')
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', 'solidityStaticAnalysis'])
  }
  const startLearnEth = async () => {
    await plugin.appManager.activatePlugin(['LearnEth', 'solidity', 'solidityUnitTesting'])
    plugin.verticalIcons.select('LearnEth')
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', 'LearnEth'])
  }
  const startCookbook = async () => {
    await plugin.appManager.activatePlugin(['cookbookdev'])
    plugin.verticalIcons.select('cookbookdev')
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', 'cookbookdev'])
  }
  const startSolidityUnitTesting = async () => {
    await plugin.appManager.activatePlugin(['solidity', 'solidityUnitTesting'])
    plugin.verticalIcons.select('solidityUnitTesting')
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', 'solidityUnitTesting'])
  }
  const startContractVerification = async () => {
    await plugin.appManager.activatePlugin(['contract-verification'])
    plugin.verticalIcons.select('contract-verification')
    _paq.push(['trackEvent', 'hometabActivate', 'userActivate', 'contract-verification'])
  }

  function PluginCard(pluginInfo: PluginInfo) {
    return (
      <div className="card mb-3">
        <div className="d-flex align-items-center px-2 justify-content-between border-bottom">
          <div className='d-flex align-items-center'>
            <i className={`${pluginInfo.iconClass} mr-2`}></i>
            <span className="fw-bold" style={{ color: isDark ? 'white' : 'black' }}>{pluginInfo.envText}</span>
          </div>
          <ToggleSwitch id={pluginInfo.envID} isOn={true} />
        </div>
        <div className="p-2">
          <div className={`text-${pluginInfo.maintainedBy === 'Remix' ? 'success' : 'dark'} mb-1`}><i className="fa-solid fa-shield-halved mr-2"></i>Maintained by {pluginInfo.maintainedBy}</div>
          <div className="small">Description</div>
          <div className="small mb-2" style={{ color: isDark ? 'white' : 'black' }}>{intl.formatMessage({ id: pluginInfo.descriptionId })}</div>
          <a href={pluginInfo.documentationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-100 text-decoration-none"><i className="fa-solid fa-book mr-1"></i>Open documentation</a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-100 align-items-end remixui_featuredplugins_container" id="hTFeaturedPlugins">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 style={{ color: isDark ? 'white' : 'black' }}>Most used plugins</h6>
        <button className="btn btn-secondary btn-sm" onClick={() => plugin.call('menuicons', 'select', 'pluginManager')} >Explore all plugins</button>
      </div>
      <div className="row">
        {
          featuredPlugins.map((pluginInfo) => (
            <div className="col-md-6">{ PluginCard(pluginInfo) }</div>
          ))}
      </div>
    </div>
  )
}

export default HomeTabFeaturedPlugins
