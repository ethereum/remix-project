import React, {useState, useEffect} from 'react' // eslint-disable-line
import { FormattedMessage, useIntl } from 'react-intl'
import { ContractPropertyName, ContractSelectionProps, ScanReport } from './types'
import {PublishToStorage} from '@remix-ui/publish-to-storage' // eslint-disable-line
import {TreeView, TreeViewItem} from '@remix-ui/tree-view' // eslint-disable-line
import {CopyToClipboard} from '@remix-ui/clipboard' // eslint-disable-line
import { saveAs } from 'file-saver'
import { AppModal } from '@remix-ui/app'
import { SolScanTable } from './solScanTable'
import axios from 'axios'

import './css/style.css'
import { CustomTooltip } from '@remix-ui/helper'
import { endpointUrls } from '@remix-endpoints-helper'

const _paq = (window._paq = window._paq || [])

export const ContractSelection = (props: ContractSelectionProps) => {
  const { api, compiledFileName, contractsDetails, contractList, compilerInput, modal } = props
  const [selectedContract, setSelectedContract] = useState('')
  const [storage, setStorage] = useState(null)

  const intl = useIntl()

  useEffect(() => {
    if (contractList.length) {
      const compiledPathArr = compiledFileName.split('/')
      const compiledFile = compiledPathArr[compiledPathArr.length - 1]
      const contractsInCompiledFile = contractList.filter((obj) => obj.file === compiledFile)
      if (contractsInCompiledFile.length) setSelectedContract(contractsInCompiledFile[0].name)
      else setSelectedContract(contractList[0].name)
    }
  }, [contractList])

  const resetStorage = () => {
    setStorage('')
  }

  const handleContractChange = (contractName: string) => {
    setSelectedContract(contractName)
  }

  const handlePublishToStorage = (type) => {
    setStorage(type)
  }

  const copyABI = () => {
    return copyContractProperty('abi')
  }

  const copyContractProperty = (property) => {
    let content = getContractProperty(property)
    if (!content) {
      return
    }

    try {
      if (typeof content !== 'string') {
        content = JSON.stringify(content, null, '\t')
      }
    } catch (e) {}

    return content
  }

  const getContractProperty = (property) => {
    if (!selectedContract) throw new Error('No contract compiled yet')
    const contractProperties = contractsDetails[selectedContract]

    if (contractProperties && contractProperties[property]) return contractProperties[property]
    return null
  }

  const renderData = (item, key: string | number, keyPath: string) => {
    const data = extractData(item)
    const children = (data.children || []).map((child) => renderData(child.value, child.key, keyPath + '/' + child.key))

    if (children && children.length > 0) {
      return (
        <TreeViewItem
          id={`treeViewItem${key}`}
          key={keyPath}
          label={
            <div className="d-flex mt-2 flex-row remixui_label_item">
              <label className="font-weight-bold pr-1 remixui_label_key">{key}:</label>
              <label className="m-0 remixui_label_value">{typeof data.self === 'boolean' ? `${data.self}` : data.self}</label>
            </div>
          }
        >
          <TreeView id={`treeView${key}`} key={keyPath}>
            {children}
          </TreeView>
        </TreeViewItem>
      )
    } else {
      return (
        <TreeViewItem
          id={key.toString()}
          key={keyPath}
          label={
            <div className="d-flex mt-2 flex-row remixui_label_item">
              <label className="font-weight-bold pr-1 remixui_label_key">{key}:</label>
              <label className="m-0 remixui_label_value">{typeof data.self === 'boolean' ? `${data.self}` : data.self}</label>
            </div>
          }
        />
      )
    }
  }

  const extractData = (item) => {
    const ret = { children: null, self: null }

    if (item instanceof Array) {
      ret.children = item.map((item, index) => ({ key: index, value: item }))
      ret.self = ''
    } else if (item instanceof Object) {
      ret.children = Object.keys(item).map((key) => ({
        key: key,
        value: item[key]
      }))
      ret.self = ''
    } else {
      ret.self = item
      ret.children = []
    }
    return ret
  }

  const insertValue = (details, propertyName: ContractPropertyName) => {
    let node
    if (propertyName === 'web3Deploy' || propertyName === 'name' || propertyName === 'Assembly') {
      node = <pre>{details[propertyName]}</pre>
    } else if (details[propertyName] && (propertyName === 'abi' || propertyName === 'metadata' || propertyName === 'compilerInput')) {
      if (details[propertyName] !== '') {
        try {
          node = (
            <div>
              {typeof details[propertyName] === 'object' ? (
                <TreeView id="treeView">{Object.keys(details[propertyName]).map((innerkey) => renderData(details[propertyName][innerkey], innerkey, innerkey))}</TreeView>
              ) : (
                <TreeView id="treeView">
                  {Object.keys(JSON.parse(details[propertyName])).map((innerkey) => renderData(JSON.parse(details[propertyName])[innerkey], innerkey, innerkey))}
                </TreeView>
              )}
            </div>
          ) // catch in case the parsing fails.
        } catch (e) {
          node = (
            <div>
              <FormattedMessage id="solidity.unableToDisplay" /> "${propertyName}": ${e.message}
            </div>
          )
        }
      } else {
        node = <div> - </div>
      }
    } else {
      node = <div>{JSON.stringify(details[propertyName], null, 4)}</div>
    }
    return <pre className="remixui_value">{node || ''}</pre>
  }

  const payload = {
    saveAs: saveAs,
    contractProperties: {},
    selectedContract: '',
    help: {},
    insertValue: insertValue
  }

  const details = () => {
    _paq.push(['trackEvent', 'compiler', 'compilerDetails', 'display'])
    if (!selectedContract) throw new Error('No contract compiled yet')

    const help = {
      'Assembly': 'Assembly opcodes describing the contract including corresponding solidity source code',
      'Opcodes': 'Assembly opcodes describing the contract',
      'Runtime Bytecode': 'Bytecode storing the state and being executed during normal contract call',
      'bytecode': 'Bytecode being executed during contract creation',
      'compilerInput': 'Input to the Solidity compiler',
      'functionHashes': 'List of declared function and their corresponding hash',
      'gasEstimates': 'Gas estimation for each function call',
      'metadata': 'Contains all information related to the compilation',
      'metadataHash': 'Hash representing all metadata information',
      'abi': 'ABI: describing all the functions (input/output params, scope, ...)',
      'name': 'Name of the compiled contract',
      'swarmLocation': 'Swarm url where all metadata information can be found (contract needs to be published first)',
      'storageLayout': 'See the Storage Layout documentation.',
      'devdoc': 'Developer documentation (natspec)',
      'userdoc': 'User documentation (natspec)',
      'web3Deploy': 'Copy/paste this code to any JavaScript/Web3 console to deploy this contract'
    }
    let contractProperties: any = {}
    // Make 'compilerInput' first field to display it as first item in 'Compilation Details' modal
    if (compilerInput) contractProperties.compilerInput = compilerInput
    contractProperties = Object.assign(contractProperties, contractsDetails[selectedContract])
    payload.contractProperties = contractProperties
    payload.selectedContract = selectedContract
    payload.help = help
    payload.insertValue = insertValue
    const log = (
      <div className="remixui_detailsJSON">
        <TreeView>
          {Object.keys(contractProperties).map((propertyName: ContractPropertyName, index) => {
            const copyDetails = (
              <span className="remixui_copyDetails">
                <CopyToClipboard tip={intl.formatMessage({ id: 'solidity.copy' })} content={contractProperties[propertyName]} direction="top" />
              </span>
            )
            const questionMark = (
              <span className="remixui_questionMark">
                <i
                  title={intl.formatMessage({
                    id: `solidity.${propertyName}`,
                    defaultMessage: help[propertyName]
                  })}
                  className="fas fa-question-circle"
                  aria-hidden="true"
                ></i>
              </span>
            )

            return (
              <div className="remixui_log" key={index}>
                <TreeViewItem
                  label={
                    <div data-id={`remixui_treeviewitem_${propertyName}`} className="remixui_key">
                      {propertyName} {copyDetails} {questionMark}
                    </div>
                  }
                >
                  {insertValue(contractProperties, propertyName)}
                </TreeViewItem>
              </div>
            )
          })}
        </TreeView>
      </div>
    )
    const downloadFn = () => {
      _paq.push(['trackEvent', 'compiler', 'compilerDetails', 'download'])
      saveAs(new Blob([JSON.stringify(contractProperties, null, '\t')]), `${selectedContract}_compData.json`)
    }
    // modal(selectedContract, log, intl.formatMessage({id: 'solidity.download'}), downloadFn, true, intl.formatMessage({id: 'solidity.close'}), null)
  }

  const copyBytecode = () => {
    const bytecodeObj = JSON.parse(copyContractProperty('bytecode'))
    return bytecodeObj.object
  }

  const runStaticAnalysis = async () => {
    _paq.push(['trackEvent', 'solidityCompiler', 'runStaticAnalysis', 'initiate'])
    const plugin = api as any
    const isStaticAnalyzersActive = await plugin.call('manager', 'isActive', 'solidityStaticAnalysis')
    if (!isStaticAnalyzersActive) {
      await plugin.call('manager', 'activatePlugin', 'solidityStaticAnalysis')
    }
    plugin.call('menuicons', 'select', 'solidityStaticAnalysis')
  }

  const handleScanContinue = async () => {
    const plugin = api as any
    await plugin.call('notification', 'toast', 'Processing data to scan, can take 3-5 seconds...')
    _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'initiateScan'])
    const workspace = await plugin.call('filePanel', 'getCurrentWorkspace')
    const fileName = `${workspace.name}/${props.compiledFileName}`
    const filePath = `.workspaces/${fileName}`
    const file = await plugin.call('fileManager', 'readFile', filePath)

    const urlResponse = await axios.post(`${endpointUrls.solidityScan}/uploadFile`, { file, fileName })

    if (urlResponse.data.status === 'success') {
      const ws = new WebSocket(`${endpointUrls.solidityScanWebSocket}/solidityscan`)

      ws.addEventListener('error', console.error);

      ws.addEventListener('open', async (event) => {
        await plugin.call('notification', 'toast', 'Loading scan result in Remix terminal...')
      })

      ws.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "auth_token_register" && data.payload.message === "Auth token registered.") {
          // Message on Bearer token successful registration
          const reqToInitScan = {
            "action": "message",
            "payload": {
              "type": "private_project_scan_initiate",
              "body": {
                "file_urls": [
                  urlResponse.data.result.url
                ],
                "project_name": "RemixProject",
                "project_type": "new"
              }
            }
          }
          ws.send(JSON.stringify(reqToInitScan))
          _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'requestSentToRunScan'])
        } else if (data.type === "scan_status" && data.payload && data.payload.scan_status && data.payload.scan_status === "download_failed") {
          // Message on failed scan
          _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', `scanFailedWith:${data.payload.scan_status_err_message}`])
          const modal: AppModal = {
            id: 'SolidityScanError',
            title: <FormattedMessage id="solidity.solScan.errModalTitle" />,
            message: data.payload.scan_status_err_message,
            okLabel: 'Close'
          }
          await plugin.call('notification', 'modal', modal)
          ws.close()
        } else if (data.type === "scan_status" && data.payload && data.payload.scan_status && data.payload.scan_status === "scan_done") {
          // Message on successful scan
          _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'scanSuccess'])
          const url = data.payload.scan_details.link

          const { data: scanData } = await axios.post(`${endpointUrls.solidityScan}/downloadResult`, { url })
          const scanReport: ScanReport = scanData.scan_report
          if (scanReport?.multi_file_scan_details?.length) {
            for (const template of scanReport.multi_file_scan_details) {
              if (template.metric_wise_aggregated_findings?.length) {
                const { metric_wise_aggregated_findings } = template
                const positions = []
                for (const details of metric_wise_aggregated_findings) {
                  const { findings } = details
                  for (const f of findings)
                    positions.push(`${f.line_nos_start[0]}:${f.line_nos_end[0]}`)
                }
                template.positions = JSON.stringify(positions)
              }
            }
            await plugin.call('terminal', 'logHtml', <SolScanTable scanReport={scanReport} fileName={fileName}/>)
            _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'scanResultRendered'])
          } else {
            _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', `failedOnDownloadResult:${scanReport.scan_status}`])
            const modal: AppModal = {
              id: 'SolidityScanError',
              title: <FormattedMessage id="solidity.solScan.errModalTitle" />,
              message: "Some error occurred! Please try again",
              okLabel: 'Close'
            }
            await plugin.call('notification', 'modal', modal)
          }
          ws.close()
        }
      })
    } else {
      await plugin.call('notification', 'toast', 'Error in processing data to scan')
      const err = urlResponse.data && urlResponse.data.error ? urlResponse.data.error : urlResponse
      _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', `scanFailedWithURLResponse: ${err}`])
      console.error(err)
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
        </span>
        <br/>
        <FormattedMessage id="solidity.solScan.likeToContinue" />
      </div>,
      okLabel: <FormattedMessage id="solidity.solScan.modalOkLabel" />,
      okFn: handleScanContinue,
      cancelLabel: <FormattedMessage id="solidity.solScan.modalCancelLabel" />,
      cancelFn:() => { _paq.push(['trackEvent', 'solidityCompiler', 'solidityScan', 'cancelClicked'])}
    }
    await (api as any).call('notification', 'modal', modal)
  }

  return (
    // define swarm logo
    <>
      {contractList.length ? (
        <section className="px-4 pt-3">
          {/* Select Compiler Version */}
          <div className="mb-3">
            <label className="remixui_compilerLabel form-check-label" htmlFor="compiledContracts">
              <FormattedMessage id="solidity.contract" />
            </label>
            <select onChange={(e) => handleContractChange(e.target.value)} value={selectedContract} data-id="compiledContracts" id="compiledContracts" className="custom-select">
              {contractList.map(({ name, file }, index) => (
                <option value={name} key={index}>
                  {name} ({file})
                </option>
              ))}
            </select>
          </div>
          <article className="mt-2 pb-0">
            <CustomTooltip
              placement={'auto-end'}
              tooltipId="runStaticAnalysisTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={`${intl.formatMessage({
                id: 'solidity.runStaticAnalysis.iconTooltip'
              })}`}
            >
              <button
                id="runStaticAnalysis"
                className="btn border btn-block"
                onClick={() => {
                  runStaticAnalysis()
                }}
              >
                <span>
                  <img id="ssaLogo" className="remixui_storageLogo mr-2" src="assets/img/staticAnalysisColorBlue.webp" />
                  <span>
                    <FormattedMessage id="solidity.runStaticAnalysis" />
                  </span>
                </span>
              </button>
            </CustomTooltip>
            <CustomTooltip
              placement={'auto-end'}
              tooltipId="runSolidityScanTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={`${intl.formatMessage({
                id: 'solidity.solScan.iconTooltip'
              })}`}
            >
              <button
                id="runSolidityScan"
                className="btn border btn-block"
                onClick={() => {
                  runSolidityScan()
                }}
              >
                <span>
                  <img id="solscanLogo" className="remixui_storageLogo mr-2" src="assets/img/solidityScanLogo.webp" />
                  <span>
                    <FormattedMessage id="solidity.runSolidityScan" />
                  </span>
                </span>
              </button>
            </CustomTooltip>
            <CustomTooltip
              placement={'auto-end'}
              tooltipId="publishOnIpfsTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={`${intl.formatMessage({
                id: 'solidity.publishOn'
              })} Ipfs`}
            >
              <button
                id="publishOnIpfs"
                className="btn border btn-block"
                onClick={() => {
                  handlePublishToStorage('ipfs')
                }}
              >

                <span>
                  <img id="ipfsLogo" className="remixui_storageLogo mr-2" src="assets/img/ipfs.webp" />
                  <span>
                    <FormattedMessage id="solidity.publishOn" /> IPFS
                  </span>
                </span>
              </button>
            </CustomTooltip>
            <CustomTooltip
              placement={'auto-end'}
              tooltipId="publishOnSwarmTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={`${intl.formatMessage({
                id: 'solidity.publishOn'
              })} Swarm`}
            >
              <button
                id="publishOnSwarm"
                className="btn border btn-block"
                onClick={() => {
                  handlePublishToStorage('swarm')
                }}
              >
                <span>
                  <img id="swarmLogo" className="remixui_storageLogo mr-2" src="assets/img/swarmColor.webp" />
                  <span>
                    <FormattedMessage id="solidity.publishOn" /> Swarm
                  </span>
                </span>
              </button>
            </CustomTooltip>
            <CustomTooltip
              placement={'auto-end'}
              tooltipId="CompilationDetailsTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id="solidity.displayContractDetails" />}
            >
              <button
                data-id="compilation-details"
                className="btn border btn-block"
                onClick={async () => {
                  details()
                  await (api as any).call('compilationDetails', 'showDetails', payload)
                }}
              >
                <span>
                  <i className="fa-regular fa-memo-pad mr-2 text-primary"></i>
                  <span>
                    <FormattedMessage id="solidity.compilationDetails" />
                  </span>
                </span>
              </button>
            </CustomTooltip>
            {/* Copy to Clipboard */}
            <div className="remixui_contractHelperButtons">
              <div className="input-group">
                <div className="btn-group" role="group" aria-label="Copy to Clipboard">
                  <CopyToClipboard tip={intl.formatMessage({ id: 'solidity.copyABI' })} getContent={copyABI} direction="top">
                    <button className="btn remixui_copyButton">
                      <i className="remixui_copyIcon far fa-copy" aria-hidden="true"></i>
                      <span>ABI</span>
                    </button>
                  </CopyToClipboard>
                  <CopyToClipboard tip={intl.formatMessage({ id: 'solidity.copyBytecode' })} getContent={copyBytecode} direction="top">
                    <button className="btn remixui_copyButton">
                      <i className="remixui_copyIcon far fa-copy" aria-hidden="true"></i>
                      <span>Bytecode</span>
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </article>
        </section>
      ) : (
        <section className="m-0 clearfix">
          <article className="px-2 mt-2 pb-0 d-flex w-100">
            <span className="mt-2 mx-3 w-100 alert alert-warning" role="alert">
              <FormattedMessage id="solidity.noContractCompiled" />
            </span>
          </article>
        </section>
      )}
      <PublishToStorage api={api} storage={storage} contract={contractsDetails[selectedContract]} resetStorage={resetStorage} />
    </>
  )
}

export default ContractSelection
