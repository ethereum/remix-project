// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import { ContractData, ContractDropdownProps, FuncABI } from '../types'
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
  const [selectedContract, setSelectedContract] = useState<string>('')
  const [compFails, setCompFails] = useState<'none' | 'block'>('none')
  const [loadedContractData, setLoadedContractData] = useState<ContractData>(null)
  const [constructorInterface, setConstructorInterface] = useState<FuncABI>(null)
  const [constructorInputs, setConstructorInputs] = useState(null)
  const { contractList, loadType, currentFile, compilationCount } = props.contracts

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
      if (!selectedContract) enableAtAddress(false)
    } else {
      if (!selectedContract) enableAtAddress(false)
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
    if (selectedContract) {
      const contract = contractList.find(contract => contract.alias === selectedContract)

      if (contract) {
        const loadedContractData = props.getSelectedContract(selectedContract, contract.name)

        if (loadedContractData) {
          setLoadedContractData(loadedContractData)
          setConstructorInterface(loadedContractData.getConstructorInterface())
          setConstructorInputs(loadedContractData.getConstructorInputs())
        }
      }
    }
  }, [selectedContract, compilationCount])

  useEffect(() => {
    initSelectedContract()
  }, [contractList])

  const initSelectedContract = () => {
    if (contractList.length > 0) {
      const contract = contractList.find(contract => contract.alias === selectedContract)

      if (!selectedContract || !contract) setSelectedContract(contractList[0].alias)
    }
  }

  const enableAtAddress = (enable: boolean) => {
    if (enable) {
      setAtAddressOptions({
        disabled: false,
        title: 'Interact with the given contract.'
      })
    } else {
      setAtAddressOptions({
        disabled: true,
        title: loadedAddress ? '⚠ Compile *.sol file or select *.abi file.' : '⚠ Compile *.sol file or select *.abi file & then enter the address of deployed contract.'
      })
    }
  }

  const enableContractNames = (enable: boolean) => {
    if (enable) {
      setContractOptions({
        disabled: false,
        title: 'Select contract for Deploy or At Address.'
      })
    } else {
      setContractOptions({
        disabled: true,
        title: loadType === 'sol' ? '⚠ Select and compile *.sol file to deploy or access a contract.' : '⚠ Selected *.abi file allows accessing contracts, select and compile *.sol file to deploy and access one.'
      })
    }
  }

  const clickCallback = (inputs, value) => {
    createInstance(loadedContractData, value)
  }

  const createInstance = (selectedContract, args) => {
    if (selectedContract.bytecodeObject.length === 0) {
      return props.modal('Alert', 'This contract may be abstract, not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.', 'OK', () => {})
    }
    props.createInstance(loadedContractData, props.gasEstimationPrompt, props.passphrasePrompt, props.logBuilder, props.publishToStorage, props.mainnetPrompt, isOverSizePrompt, args)
  }

  const atAddressChanged = (event) => {
    const value = event.target.value

    if (!value) {
      enableAtAddress(false)
    } else {
      if (atAddressOptions.disabled && (loadType === 'sol' || loadType === 'abi')) {
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

    setSelectedContract(value)
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
        <select value={selectedContract} onChange={handleContractChange} className="udapp_contractNames custom-select" disabled={contractOptions.disabled} title={contractOptions.title} style={{ display: loadType === 'abi' ? 'none' : 'block' }}>
          { contractList.map((contract, index) => {
            return <option key={index} value={contract.alias}>{contract.alias} - {contract.file}</option>
          }) }
        </select>
        { (contractList.length <= 0) && <i style={{ display: compFails }} title="No contract compiled yet or compilation failed. Please check the compile tab for more information." className="m-2 ml-3 fas fa-times-circle udapp_errorIcon" ></i> }
        <span className="py-1" style={{ display: abiLabel.display }}>{ abiLabel.content }</span>
      </div>
      <div>
        <div className="udapp_deployDropdown">
          { contractList.length <= 0 ? 'No compiled contracts'
            : loadedContractData ? <div>
              <ContractGUI title='Deploy' funcABI={constructorInterface} clickCallBack={clickCallback} inputs={constructorInputs} widthClass='w-50' evmBC={loadedContractData.bytecodeObject} lookupOnly={false} />
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
