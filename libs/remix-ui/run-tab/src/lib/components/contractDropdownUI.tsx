// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import { ContractDropdownProps, DeployMode } from '../types'
import { ContractData, FuncABI } from '@remix-project/core-plugin'
import { OverlayTrigger, Tooltip } from 'react-bootstrap' // eslint-disable-line
import * as ethJSUtil from 'ethereumjs-util'
import { ContractGUI } from './contractGUI'
import { deployWithProxyMsg, upgradeWithProxyMsg } from '@remix-ui/helper'
const _paq = window._paq = window._paq || []

export function ContractDropdownUI(props: ContractDropdownProps) {
  const [abiLabel, setAbiLabel] = useState<{
    display: string,
    content: string
  }>({
    display: '',
    content: ''
  })
  const [atAddressOptions, setAtAddressOptions] = useState<{ title: string, disabled: boolean }>({
    title: 'address of contract',
    disabled: true
  })
  const [loadedAddress, setLoadedAddress] = useState<string>('')
  const [contractOptions, setContractOptions] = useState<{ title: string, disabled: boolean }>({
    title: 'Please compile *.sol file to deploy or access a contract',
    disabled: true
  })
  const [loadedContractData, setLoadedContractData] = useState<ContractData>(null)
  const [constructorInterface, setConstructorInterface] = useState<FuncABI>(null)
  const [constructorInputs, setConstructorInputs] = useState(null)
  const [compilerName, setCompilerName] = useState<string>('')
  const contractsRef = useRef<HTMLSelectElement>(null)
  const atAddressValue = useRef<HTMLInputElement>(null)
  const { contractList, loadType, currentFile, compilationSource, currentContract, compilationCount, deployOptions, proxyKey } = props.contracts

  useEffect(() => {
    enableContractNames(Object.keys(props.contracts.contractList).length > 0)
  }, [Object.keys(props.contracts.contractList).length])

  useEffect(() => {
    enableAtAddress(false)
    setAbiLabel({
      display: 'none',
      content: 'ABI file selected'
    })
  }, [])

  useEffect(() => {
    if (props.exEnvironment && props.networkName) {
      const savedConfig = window.localStorage.getItem(`ipfs/${props.exEnvironment}/${props.networkName}`)
      const isCheckedIPFS = savedConfig === 'true' ? true : false // eslint-disable-line

      props.setIpfsCheckedState(isCheckedIPFS)
    }
  }, [props.exEnvironment, props.networkName])

  useEffect(() => {
    if (!loadFromAddress || !ethJSUtil.isValidAddress(loadedAddress)) enableAtAddress(false)
  }, [loadedAddress])

  useEffect(() => {
    if (/.(.abi)$/.exec(currentFile) && "" !== atAddressValue.current.value) {
      setAbiLabel({
        display: 'block',
        content: currentFile
      })
      enableAtAddress(true)
    } else if (isContractFile(currentFile)) {
      setAbiLabel({
        display: 'none',
        content: ''
      })
      if (!currentContract) enableAtAddress(false)
    } else {
      setAbiLabel({
        display: 'none',
        content: ''
      })
      if (!currentContract) enableAtAddress(false)
    }
    initSelectedContract()
  }, [loadType, currentFile, compilationCount])

  useEffect(() => {
    if (currentContract && contractList[currentFile]) {
      const contract = contractList[currentFile].find(contract => contract.alias === currentContract)

      if (contract) {
        const loadedContractData = props.getSelectedContract(currentContract, contract.compiler)

        if (loadedContractData) {
          setLoadedContractData(loadedContractData)
          setConstructorInterface(loadedContractData.getConstructorInterface())
          setConstructorInputs(loadedContractData.getConstructorInputs())
        }
      }
    }
  }, [currentContract, compilationCount])

  useEffect(() => {
    initSelectedContract()
    updateCompilerName()
  }, [contractList])

  useEffect(() => {
    // if the file change the ui is already feed with another bunch of contracts.
    // we also need to update the state
    const contracts = contractList[currentFile]
    if (contracts && contracts.length > 0) {
      props.setSelectedContract(contracts[0].alias)
    }
    updateCompilerName()
  }, [currentFile])

  const initSelectedContract = () => {
    const contracts = contractList[currentFile]

    if (contracts && contracts.length > 0) {
      const contract = contracts.find(contract => contract.alias === currentContract)

      if (!currentContract) props.setSelectedContract(contracts[0].alias)
      else if (!contract) props.setSelectedContract(currentContract)
      // TODO highlight contractlist box with css.
    }
  }

  const isContractFile = (file) => {
    return /.(.sol)$/.exec(file) ||
      /.(.vy)$/.exec(file) || // vyper
      /.(.lex)$/.exec(file) || // lexon
      /.(.contract)$/.exec(file)
  }

  const enableAtAddress = (enable: boolean) => {
    if (enable) {
      setAtAddressOptions({
        disabled: false,
        title: 'Interact with the deployed contract - requires the .abi file or compiled .sol file to be selected in the editor (with the same compiler configuration)'
      })
    } else {
      setAtAddressOptions({
        disabled: true,
        title: loadedAddress ? 'Compile a *.sol file or select a *.abi file.' : 'To interact with a deployed contract, enter its address and compile its source *.sol file (with the same compiler settings) or select its .abi file in the editor. '
      })
    }
  }

  const enableContractNames = (enable: boolean) => {
    if (enable) {
      setContractOptions({
        disabled: false,
        title: 'Select a compiled contract to deploy or to use with At Address.'
      })
    } else {
      setContractOptions({
        disabled: true,
        title: loadType === 'sol' ? 'Select and compile *.sol file to deploy or access a contract.' : 'When there is a compiled .sol file, the choice of contracts to deploy or to use with AtAddress is made here.'
      })
    }
  }

  const clickCallback = (inputs, value, deployMode?: DeployMode[]) => {
    createInstance(loadedContractData, value, deployMode)
  }

  const createInstance = (selectedContract, args, deployMode?: DeployMode[]) => {
    if (selectedContract.bytecodeObject.length === 0) {
      return props.modal('Alert', 'This contract may be abstract, it may not implement an abstract parent\'s methods completely or it may not invoke an inherited contract\'s constructor correctly.', 'OK', () => { })
    }
    if ((selectedContract.name !== currentContract) && (selectedContract.name === 'ERC1967Proxy')) selectedContract.name = currentContract
    const isProxyDeployment = (deployMode || []).find(mode => mode === 'Deploy with Proxy')
    const isContractUpgrade = (deployMode || []).find(mode => mode === 'Upgrade with Proxy')

    if (isProxyDeployment) {
      props.modal('Deploy Implementation & Proxy (ERC1967)', deployWithProxyMsg(), 'Proceed', () => {
        props.createInstance(loadedContractData, props.gasEstimationPrompt, props.passphrasePrompt, props.publishToStorage, props.mainnetPrompt, isOverSizePrompt, args, deployMode)
      }, 'Cancel', () => { })
    } else if (isContractUpgrade) {
      props.modal('Deploy Implementation & Update Proxy', upgradeWithProxyMsg(), 'Proceed', () => {
        props.createInstance(loadedContractData, props.gasEstimationPrompt, props.passphrasePrompt, props.publishToStorage, props.mainnetPrompt, isOverSizePrompt, args, deployMode)
      }, 'Cancel', () => { })
    } else {
      props.createInstance(loadedContractData, props.gasEstimationPrompt, props.passphrasePrompt, props.publishToStorage, props.mainnetPrompt, isOverSizePrompt, args, deployMode)
    }
  }

  const atAddressChanged = (event) => {
    const value = event.target.value
    if (!value) {
      enableAtAddress(false)
    } else {
      if (loadType === 'sol' || loadType === 'abi') {
        enableAtAddress(true)
      } else {
        enableAtAddress(false)
      }
    }
    setLoadedAddress(value)
  }

  const loadFromAddress = () => {
    let address = loadedAddress

    if (!ethJSUtil.isValidChecksumAddress(address)) {
      props.tooltip(checkSumWarning())
      address = ethJSUtil.toChecksumAddress(address)
    }
    props.loadAddress(loadedContractData, address)
  }

  const handleCheckedIPFS = () => {
    const checkedState = !props.ipfsCheckedState

    props.setIpfsCheckedState(checkedState)
    window.localStorage.setItem(`ipfs/${props.exEnvironment}/${props.networkName}`, checkedState.toString())
  }

  const updateCompilerName = () => {
    if (contractsRef.current.value) {
      contractList[currentFile].forEach(contract => {
        if (contract.alias === contractsRef.current.value) {
          setCompilerName(contract.compilerName)
        }
      })
    } else{
      setCompilerName('')
    }
  }

  const handleContractChange = (e) => {
    const value = e.target.value
    updateCompilerName()
    props.setSelectedContract(value)
  }

  const checkSumWarning = () => {
    return (
      <span>
        It seems you are not using a checksumed address.
        <br />A checksummed address is an address that contains uppercase letters, as specified in <a href="https://eips.ethereum.org/EIPS/eip-55" target="_blank" rel="noreferrer">EIP-55</a>.
        <br />Checksummed addresses are meant to help prevent users from sending transactions to the wrong address.
      </span>
    )
  }

  const isOverSizePrompt = () => {
    return (
      <div>Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fails. <br />
        More info: <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-170.md" target="_blank" rel="noreferrer">eip-170</a>
      </div>
    )
  }

  return (
    <div className="udapp_container" data-id="contractDropdownContainer">
      <div className='d-flex justify-content-between'>
        <div className="d-flex justify-content-between align-items-end">
          <label className="udapp_settingsLabel pr-1">Contract</label>
          <div className="d-flex">{compilerName && compilerName !== '' && <label className="text-capitalize" style={{ maxHeight: '0.6rem', lineHeight: '1rem' }} data-id="udappCompiledBy">(Compiled by {compilerName})</label>}</div>
        </div>
        {props.remixdActivated ?
          <OverlayTrigger placement={'right'} overlay={
            <Tooltip className="text-nowrap" id="info-sync-compiled-contract">
              <div>Click here to import contracts compiled from an external framework.</div>
              <div>This action is enabled when Remix is connected to an external framework (hardhat, truffle, foundry) through remixd.</div>
            </Tooltip>
          }>
            <button className="btn d-flex py-0" onClick={_ => {
              props.syncContracts()
              _paq.push(['trackEvent', 'udapp', 'syncContracts', compilationSource])
            }}>
              <i style={{ cursor: 'pointer' }} className="fa fa-refresh mr-2 mt-2" aria-hidden="true"></i>
            </button>
          </OverlayTrigger>
          : null}
      </div>
      <div className="udapp_subcontainer">
        <select ref={contractsRef} value={currentContract} onChange={handleContractChange} className="udapp_contractNames custom-select" disabled={contractOptions.disabled} title={contractOptions.title} style={{ display: loadType === 'abi' && !isContractFile(currentFile) ? 'none' : 'block' }}>
          {(contractList[currentFile] || []).map((contract, index) => {
            return <option key={index} value={contract.alias}>
              {contract.alias} - {contract.file}
            </option>
          })}
        </select>
        <span className="py-1" style={{ display: abiLabel.display }}>{abiLabel.content}</span>
      </div>
      <div>
        <div className="udapp_deployDropdown">
          {((contractList[currentFile] && contractList[currentFile].filter(contract => contract)) || []).length <= 0 ? 'No compiled contracts'
            : loadedContractData ? <div>
              <ContractGUI
                title='Deploy'
                isDeploy={true}
                deployOption={deployOptions[currentFile] && deployOptions[currentFile][currentContract] ? deployOptions[currentFile][currentContract].options : null}
                initializerOptions={deployOptions[currentFile] && deployOptions[currentFile][currentContract] ? deployOptions[currentFile][currentContract].initializeOptions : null}
                funcABI={constructorInterface}
                clickCallBack={clickCallback}
                inputs={constructorInputs}
                widthClass='w-50'
                evmBC={loadedContractData.bytecodeObject}
                lookupOnly={false}
                savedProxyAddress={proxyKey}
              />
              <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
                  <input
                    id="deployAndRunPublishToIPFS"
                    data-id="contractDropdownIpfsCheckbox"
                    className="form-check-input custom-control-input"
                    type="checkbox"
                    onChange={handleCheckedIPFS}
                    checked={props.ipfsCheckedState}
                  />
                <OverlayTrigger placement={'right'} overlay={
                  <Tooltip className="text-nowrap" id="remixIpfsUdappTooltip">
                    <span>{"Publishing the source code and metadata to IPFS facilitates source code verification using Sourcify and will greatly foster contract adoption (auditing, debugging, calling it, etc...)"}</span>
                  </Tooltip>
                }>
                  <label
                    htmlFor="deployAndRunPublishToIPFS"
                    data-id="contractDropdownIpfsCheckboxLabel"
                    className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
                  >
                    Publish to IPFS
                  </label>
                </OverlayTrigger>
              </div>
            </div> : ''
          }
        </div>
        <div className="udapp_orLabel mt-2" style={{ display: loadType === 'abi' && !isContractFile(currentFile) ? 'none' : 'block' }}>or</div>
        <div className="udapp_button udapp_atAddressSect ">
          <OverlayTrigger placement={'bottom-end'} overlay={
          <Tooltip className="text-wrap" id="runAndDeployAddresstooltip">
            <span>{atAddressOptions.title}</span>
          </Tooltip>
            }>
              <span>
                <button className="udapp_atAddress btn btn-sm btn-info" id="runAndDeployAtAdressButton" disabled={atAddressOptions.   disabled} onClick={loadFromAddress} data-title={atAddressOptions.title} style={{ pointerEvents: 'none' }}>At Address</button>
              </span>
          </OverlayTrigger>
          <input
            ref={atAddressValue}
            className="udapp_input udapp_ataddressinput ataddressinput form-control"
            placeholder="Load contract from Address"
            title="address of contract"
            onChange={atAddressChanged}
          />
        </div>
      </div>
    </div>
  )
}
