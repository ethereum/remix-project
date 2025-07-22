import React, { useState, useEffect } from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'
import { AppModal } from '@remix-ui/app'
import { FormattedMessage } from 'react-intl'
import { handleSolidityScan } from '@remix-ui/helper'

import { ArrowRightBig, IpfsLogo, SwarmLogo, SettingsLogo, SolidityScanLogo, AnalysisLogo, TsLogo } from '@remix-ui/tabs'

const _paq = (window._paq = window._paq || [])

interface CompileDropdownProps {
  tabPath?: string
  plugin?: any
  disabled?: boolean
  compiledFileName?: string
  onNotify?: (msg: string) => void
  onOpen?: () => void
  onRequestCompileAndPublish?: (type: string) => void;
}

export const CompileDropdown: React.FC<CompileDropdownProps> = ({ tabPath, plugin, disabled, onNotify, onOpen, onRequestCompileAndPublish, compiledFileName }) => {
  const [scriptFiles, setScriptFiles] = useState<string[]>([])

  const fetchScripts = async () => {
    try {
      let files = {}
      const exists = await plugin.call('fileManager', 'exists', 'scripts')
      if (exists) {
        files = await plugin.call('fileManager', 'readdir', 'scripts')
      }
      const tsFiles = Object.keys(files).filter(f => f.endsWith('.ts'))
      setScriptFiles(tsFiles)
      onNotify?.(`Loaded ${tsFiles.length} script files`)
    } catch (err) {
      console.error("Failed to read scripts directory:", err)
      onNotify?.("Failed to read scripts directory")
    }
  }

  const runScript = async (path: string) => {
    await plugin.call('solidity', 'compile', tabPath)
    const content = await plugin.call('fileManager', 'readFile', path)
    await plugin.call('scriptRunnerBridge', 'execute', content, path)
    onNotify?.(`Executed script: ${path}`)
  }

  const runRemixAnalysis = async () => {
    _paq.push(['trackEvent', 'solidityCompiler', 'staticAnalysis', 'initiate'])
    await plugin.call('solidity', 'compile', tabPath)
    const isStaticAnalyzersActive = await plugin.call('manager', 'isActive', 'solidityStaticAnalysis')
    if (!isStaticAnalyzersActive) {
      await plugin.call('manager', 'activatePlugin', 'solidityStaticAnalysis')
    }
    plugin.call('menuicons', 'select', 'solidityStaticAnalysis')
    onNotify?.("Ran Remix static analysis")
  }

  const handleScanContinue = async () => {
    await plugin.call('solidity', 'compile', tabPath)

    const firstSlashIndex = compiledFileName.indexOf('/');
    
    const finalPath = firstSlashIndex > 0 
      ? compiledFileName.substring(firstSlashIndex + 1) 
      : compiledFileName;

    await handleSolidityScan(plugin, finalPath)
  }

  const runSolidityScan = async () => {
    _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'askPermissionToScan'])
    const modal: AppModal = {
      id: 'SolidityScanPermissionHandler',
      title: <FormattedMessage id="solidity.solScan.modalTitle" />,
      message: <div className='d-flex flex-column'>
        <span><FormattedMessage id="solidity.solScan.modalMessage" />
          <a href={'https://solidityscan.com/?utm_campaign=remix&utm_source=remix'}
            target="_blank"
            onClick={() => _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'learnMore'])}>
              Learn more
          </a>
        </span><br/>
        <FormattedMessage id="solidity.solScan.likeToContinue" />
      </div>,
      okLabel: <FormattedMessage id="solidity.solScan.modalOkLabel" />,
      okFn: handleScanContinue,
      cancelLabel: <FormattedMessage id="solidity.solScan.modalCancelLabel" />
    }
    await plugin.call('notification', 'modal', modal)
  }

  const openConfiguration = async () => {
    _paq.push(['trackEvent', 'solidityCompiler', 'initiate'])
    const isSolidityCompilerActive = await plugin.call('manager', 'isActive', 'solidity')
    if (!isSolidityCompilerActive) {
      await plugin.call('manager', 'activatePlugin', 'solidity')
    }
    plugin.call('menuicons', 'select', 'solidity')
    onNotify?.("Ran Remix Solidity Compiler")
  }

  const items: MenuItem[] = [
    {
      label: 'Compile and run script',
      icon: <ArrowRightBig />,
      dataId: 'compile-run-script-menu-item',
      submenu: scriptFiles.length > 0
        ? scriptFiles.map(f => ({
          label: f, icon: <TsLogo />,
          onClick: () => runScript(f),
          dataId: `run-script-${f.replace(/[^a-zA-Z0-9-]/g, '_')}-submenu-item` }))
        : [{ label: 'No scripts found', onClick: () => {}, dataId: 'no-scripts-found-item' }]
    },
    {
      label: 'Compile and run analysis',
      icon: <ArrowRightBig />,
      dataId: 'compile-run-analysis-menu-item',
      submenu: [
        { label: 'Run Remix Analysis', icon: <AnalysisLogo />, onClick: runRemixAnalysis, dataId: 'run-remix-analysis-submenu-item' },
        { label: 'Run Solidity Scan', icon: <SolidityScanLogo />, onClick: runSolidityScan, dataId: 'run-solidity-scan-submenu-item' }
      ]
    },
    {
      label: 'Compile and publish',
      icon: <ArrowRightBig />,
      dataId: 'compile-publish-menu-item',
      submenu: [
        { label: 'Publish on IPFS', icon: <IpfsLogo />, onClick: () => onRequestCompileAndPublish('ipfs'), dataId: 'publish-ipfs-submenu-item' },
        { label: 'Publish on Swarm', icon: <SwarmLogo />, onClick: () => onRequestCompileAndPublish('swarm'), dataId: 'publish-swarm-submenu-item' }
      ]
    },
    {
      label: 'Open compiler configuration',
      icon: <SettingsLogo />,
      onClick: openConfiguration,
      borderTop: true,
      dataId: 'publish-swarm-submenu-item'
    }
  ]

  return (
    <>
      <DropdownMenu
        items={items}
        disabled={disabled}
        onOpen={() => { fetchScripts(); onOpen?.() }}
        triggerDataId="compile-dropdown-trigger"
        panelDataId="compile-dropdown-panel"
      />
    </>

  )
}

export default CompileDropdown