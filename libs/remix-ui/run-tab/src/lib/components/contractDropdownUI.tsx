// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import { ContractDropdownProps, DeployMode } from '../types'
import { ContractData, FuncABI } from '@remix-project/core-plugin'
import * as ethJSUtil from 'ethereumjs-util'
import { ContractGUI } from './contractGUI'

export function ContractDropdownUI (props: ContractDropdownProps) {
  const [abiLabel, setAbiLabel] = useState<{
    display: string,
    content: string
  }>({
    display: '',
    content: ''
  })
  const [atAddressOptions, setAtAddressOptions] = useState<{title: string, disabled: boolean}>({
    title: 'address of contract',
    disabled: true
  })
  const [loadedAddress, setLoadedAddress] = useState<string>('')
  const [contractOptions, setContractOptions] = useState<{title: string, disabled: boolean}>({
    title: 'Please compile *.sol file to deploy or access a contract',
    disabled: true
  })
  const [compFails, setCompFails] = useState<'none' | 'block'>('none')
  const [loadedContractData, setLoadedContractData] = useState<ContractData>(null)
  const [constructorInterface, setConstructorInterface] = useState<FuncABI>(null)
  const [constructorInputs, setConstructorInputs] = useState(null)
  const contractsRef = useRef<HTMLSelectElement>(null)
  const { contractList, loadType, currentFile, currentContract, compilationCount, deployOptions } = props.contracts

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
    if (/.(.abi)$/.exec(currentFile)) {
      setAbiLabel({
        display: 'block',
        content: currentFile
      })
      enableAtAddress(true)
    } else if (/.(.sol)$/.exec(currentFile) ||
        /.(.vy)$/.exec(currentFile) || // vyper
        /.(.lex)$/.exec(currentFile) || // lexon
        /.(.contract)$/.exec(currentFile)) {
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
    if (currentFile) {
      enableContractNames(true)
      setCompFails('none')
    } else {
      enableContractNames(false)
      setCompFails('block')
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
  }, [contractList])

  const initSelectedContract = () => {
    const contracts = contractList[currentFile]
  
    if (contracts && contracts.length > 0) {
      const contract = contracts.find(contract => contract.alias === currentContract)

      if (!currentContract) props.setSelectedContract(contracts[0].alias)
      else if (!contract) props.setSelectedContract(currentContract)
      // TODO highlight contractlist box with css.
    }
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
      return props.modal('Alert', 'This contract may be abstract, it may not implement an abstract parent\'s methods completely or it may not invoke an inherited contract\'s constructor correctly.', 'OK', () => {})
    }
    props.createInstance(loadedContractData, props.gasEstimationPrompt, props.passphrasePrompt, props.publishToStorage, props.mainnetPrompt, isOverSizePrompt, args, deployMode)
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

  const handleContractChange = (e) => {
    const value = e.target.value

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
      <label className="udapp_settingsLabel">Contract</label>
      <div className="udapp_subcontainer">
        <select ref={contractsRef} value={currentContract} onChange={handleContractChange} className="udapp_contractNames custom-select" disabled={contractOptions.disabled} title={contractOptions.title} style={{ display: loadType === 'abi' ? 'none' : 'block' }}>
          { (contractList[currentFile] || []).map((contract, index) => {
            return <option key={index} value={contract.alias}>{contract.alias} - {contract.file}</option>
          }) }
        </select>
        <span className="py-1" style={{ display: abiLabel.display }}>{ abiLabel.content }</span>
      </div>
      <div>
        <div className="udapp_deployDropdown">
          { ((contractList[currentFile] && contractList[currentFile].filter(contract => contract)) || []).length <= 0 ? 'No compiled contracts'
            : loadedContractData ? <div>
              <ContractGUI
                title='Deploy'
                isDeploy={true}
                deployOption={deployOptions.options}
                initializerOptions={deployOptions.initializeOptions ? deployOptions.initializeOptions[currentContract] : null}
                funcABI={constructorInterface}
                clickCallBack={clickCallback}
                inputs={constructorInputs}
                widthClass='w-50'
                evmBC={loadedContractData.bytecodeObject}
                lookupOnly={false}
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
                <label
                  htmlFor="deployAndRunPublishToIPFS"
                  data-id="contractDropdownIpfsCheckboxLabel"
                  className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
                  title="Publishing the source code and metadata to IPFS facilitates source code verification using Sourcify and will greatly foster contract adoption (auditing, debugging, calling it, etc...)"
                >
                  Publish to IPFS
                </label>
              </div>
            </div> : ''
          }
        </div>
        <div className="udapp_orLabel mt-2" style={{ display: loadType === 'abi' ? 'none' : 'block' }}>or</div>
        <div className="udapp_button udapp_atAddressSect">
          <button className="udapp_atAddress btn btn-sm btn-info" id="runAndDeployAtAdressButton" disabled={atAddressOptions.disabled} title={atAddressOptions.title} onClick={loadFromAddress}>At Address</button>
          <input
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
