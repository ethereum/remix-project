import React, { useState, useEffect } from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'
import { AppModal } from '@remix-ui/app'
import { FormattedMessage } from 'react-intl'
import { SolScanTable } from './solScanTable'
import axios from 'axios'
import { endpointUrls } from '@remix-endpoints-helper'
import { ScanReport } from '../types'

import ArrowRight from '../../assets/icons/ArrowRightBig'
import IpfsLogo from '../../assets/icons/Ipfs'
import SwarmLogo from '../../assets/icons/Swarm'
import SettingsLogo from '../../assets/icons/SolidityCompiler'
import SolidityScanLogo from '../../assets/icons/SolidityScan'
import AnalysisLogo from '../../assets/icons/Analysis'
import TsLogo from '../../assets/icons/Ts'

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
    const isStaticAnalyzersActive = await plugin.call('manager', 'isActive', 'solidityStaticAnalysis')
    if (!isStaticAnalyzersActive) {
      await plugin.call('manager', 'activatePlugin', 'solidityStaticAnalysis')
    }
    plugin.call('menuicons', 'select', 'solidityStaticAnalysis')
    onNotify?.("Ran Remix static analysis")
  }

  const handleScanContinue = async () => {
    await plugin.call('notification', 'toast', 'Processing data to scan...')
    _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'initiateScan'])

    const workspace = await plugin.call('filePanel', 'getCurrentWorkspace')
    const fileName = `${workspace.name}/${compiledFileName}`
    const filePath = `.workspaces/${compiledFileName}`
    const file = await plugin.call('fileManager', 'readFile', filePath)

    const urlResponse = await axios.post(`${endpointUrls.solidityScan}/uploadFile`, { file, fileName })

    if (urlResponse.data.status === 'success') {
      const ws = new WebSocket(`${endpointUrls.solidityScanWebSocket}/solidityscan`)
      ws.addEventListener('error', console.error)

      ws.addEventListener('open', async () => {
        await plugin.call('notification', 'toast', 'Loading scan result in Remix terminal...')
      })

      ws.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "auth_token_register" && data.payload.message === "Auth token registered.") {
          ws.send(JSON.stringify({
            action: "message",
            payload: {
              type: "private_project_scan_initiate",
              body: {
                file_urls: [urlResponse.data.result.url],
                project_name: "RemixProject",
                project_type: "new"
              }
            }
          }))
        } else if (data.type === "scan_status" && data.payload.scan_status === "download_failed") {
          _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'scanFailed'])
          await plugin.call('notification', 'modal', {
            id: 'SolidityScanError',
            title: <FormattedMessage id="solidity.solScan.errModalTitle" />,
            message: data.payload.scan_status_err_message,
            okLabel: 'Close'
          })
          ws.close()
        } else if (data.type === "scan_status" && data.payload.scan_status === "scan_done") {
          _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'scanSuccess'])
          const { data: scanData } = await axios.post(`${endpointUrls.solidityScan}/downloadResult`, { url: data.payload.scan_details.link })
          const scanReport: ScanReport = scanData.scan_report

          if (scanReport?.multi_file_scan_details?.length) {
            for (const template of scanReport.multi_file_scan_details) {
              if (template.metric_wise_aggregated_findings?.length) {
                const positions = []
                for (const details of template.metric_wise_aggregated_findings) {
                  for (const f of details.findings)
                    positions.push(`${f.line_nos_start[0]}:${f.line_nos_end[0]}`)
                }
                template.positions = JSON.stringify(positions)
              }
            }
            await plugin.call('terminal', 'logHtml', <SolScanTable scanReport={scanReport} fileName={fileName}/>)
          } else {
            await plugin.call('notification', 'modal', {
              id: 'SolidityScanError',
              title: <FormattedMessage id="solidity.solScan.errModalTitle" />,
              message: "Some error occurred! Please try again",
              okLabel: 'Close'
            })
          }
          ws.close()
        }
      })
    } else {
      await plugin.call('notification', 'toast', 'Error in processing data to scan')
      console.error(urlResponse.data && urlResponse.data.error ? urlResponse.data.error : urlResponse)
    }
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
      icon: <ArrowRight />,
      submenu: scriptFiles.length > 0
        ? scriptFiles.map(f => ({ label: f, icon: <TsLogo />, onClick: () => runScript(f) }))
        : [{ label: 'No scripts found', onClick: () => {} }]
    },
    {
      label: 'Compile and run analysis',
      icon: <ArrowRight />,
      submenu: [
        { label: 'Run Remix Analysis', icon: <AnalysisLogo />, onClick: runRemixAnalysis },
        { label: 'Run Solidity Scan', icon: <SolidityScanLogo />, onClick: runSolidityScan }
      ]
    },
    {
      label: 'Compile and publish',
      icon: <ArrowRight />, 
      submenu: [
        { label: 'Publish on IPFS', icon: <IpfsLogo />, onClick: () => onRequestCompileAndPublish('ipfs') },
        { label: 'Publish on Swarm', icon: <SwarmLogo />, onClick: () => onRequestCompileAndPublish('swarm') }
      ]
    },
    {
      label: 'Open compiler configuration',
      icon: <SettingsLogo />,
      onClick: openConfiguration,
      borderTop: true
    }
  ]

  return (
    <>
      <DropdownMenu
        items={items}
        disabled={disabled}
        onOpen={() => { fetchScripts(); onOpen?.() }}
      />
    </>

  )
}

export default CompileDropdown