// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import { ContractDropdownProps } from '../types'
import * as ethJSUtil from 'ethereumjs-util'
import { ContractGUI } from './contractGUI'

export function ContractDropdownUI (props: ContractDropdownProps) {
  const [networkName, setNetworkName] = useState<string>('')
  const [abiLabel, setAbiLabel] = useState<{
    display: string,
    content: string
  }>({
    display: '',
    content: ''
  })
  const [ipfsCheckedState, setIpfsCheckedState] = useState<boolean>(false)
  const [atAddressOptions, setAtAddressOptions] = useState<{title: string, disabled: boolean}>({
    title: 'address of contract',
    disabled: true
  })
  const [address, setAddress] = useState<string>('')
  const [contractOptions, setContractOptions] = useState<{title: string, disabled: boolean}>({
    title: 'Please compile *.sol file to deploy or access a contract',
    disabled: true
  })
  const [selectedContract, setSelectedContract] = useState<string>('')
  const [compFails, setCompFails] = useState<'none' | 'block'>('none')
  const [loadedContractData, setLoadedContractData] = useState<{
    name: string,
    contract: string,
    compiler: any,
    abi: any,
    bytecodeObject: any,
    bytecodeLinkReferences: any,
    object: any,
    deployedBytecode: any,
    getConstructorInterface: () => any,
    getConstructorInputs: () => any,
    isOverSizeLimit: () => boolean,
    metadata: any}>(null)
  const { contractList, loadType, currentFile } = props.contracts

  useEffect(() => {
    enableAtAddress(false)
    const savedConfig = window.localStorage.getItem(`ipfs/${props.exEnvironment}/${networkName}`)
    const isCheckedIPFS = savedConfig === 'true' ? true : false // eslint-disable-line

    if (isCheckedIPFS) setIpfsCheckedState(true)
    setAbiLabel({
      display: 'none',
      content: 'ABI file selected'
    })
  }, [])

  useEffect(() => {
    if (props.exEnvironment === 'vm-london' || props.exEnvironment === 'vm-berlin') setNetworkName('VM')
  }, [props.exEnvironment])

  useEffect(() => {
    if (!address || !ethJSUtil.isValidAddress(address)) enableAtAddress(false)
  }, [address])

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
    if (contractList.length > 0) {
      const contract = contractList.find(contract => contract.alias === selectedContract)

      if (!selectedContract || !contract) setSelectedContract(contractList[0].alias)
    }
  }, [loadType, currentFile])

  useEffect(() => {
    if (selectedContract) {
      const contract = contractList.find(contract => contract.alias === selectedContract)

      setLoadedContractData(props.getSelectedContract(selectedContract, contract.name))
    }
  }, [selectedContract])

  const enableAtAddress = (enable: boolean) => {
    if (enable) {
      setAtAddressOptions({
        disabled: false,
        title: 'Interact with the given contract.'
      })
    } else {
      setAtAddressOptions({
        disabled: true,
        title: address ? '⚠ Compile *.sol file or select *.abi file.' : '⚠ Compile *.sol file or select *.abi file & then enter the address of deployed contract.'
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

  const clickCallback = (inputsValues) => {
    createInstance(loadedContractData, inputsValues)
  }

  const createInstance = (selectedContract, args) => {
    if (selectedContract.bytecodeObject.length === 0) {
      return props.modal('Alert', 'This contract may be abstract, not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.', 'OK', () => {})
    }

    // var continueCb = (error, continueTxExecution, cancelCb) => {
    //   if (error) {
    //     var msg = typeof error !== 'string' ? error.message : error
    //     modalDialog('Gas estimation failed', yo`<div>Gas estimation errored with the following message (see below).
    //     The transaction execution will likely fail. Do you want to force sending? <br>
    //     ${msg}
    //     </div>`,
    //     {
    //       label: 'Send Transaction',
    //       fn: () => {
    //         continueTxExecution()
    //       }
    //     }, {
    //       label: 'Cancel Transaction',
    //       fn: () => {
    //         cancelCb()
    //       }
    //     })
    //   } else {
    //     continueTxExecution()
    //   }
    // }

    // const self = this

    // var promptCb = (okCb, cancelCb) => {
    //   modalDialogCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    // }

    // var statusCb = (msg) => {
    //   return this.logCallback(msg)
    // }

    // var finalCb = (error, contractObject, address) => {
    //   self.event.trigger('clearInstance')

    //   if (error) {
    //     return this.logCallback(error)
    //   }
    //   self.event.trigger('newContractInstanceAdded', [contractObject, address, contractObject.name])

    //   const data = self.runView.compilersArtefacts.getCompilerAbstract(contractObject.contract.file)
    //   self.runView.compilersArtefacts.addResolvedContract(helper.addressToString(address), data)
    //   if (self.ipfsCheckedState) {
    //     _paq.push(['trackEvent', 'udapp', 'DeployAndPublish', this.networkName + '_' + this.networkId])
    //     publishToStorage('ipfs', self.runView.fileProvider, self.runView.fileManager, selectedContract)
    //   } else {
    //     _paq.push(['trackEvent', 'udapp', 'DeployOnly', this.networkName + '_' + this.networkId])
    //   }
    // }

    // let contractMetadata
    // try {
    //   contractMetadata = await this.runView.call('compilerMetadata', 'deployMetadataOf', selectedContract.name, selectedContract.contract.file)
    // } catch (error) {
    //   return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
    // }

    // const compilerContracts = this.dropdownLogic.getCompilerContracts()
    // const confirmationCb = this.getConfirmationCb(modalDialog, confirmDialog)

    // if (selectedContract.isOverSizeLimit()) {
    //   return modalDialog('Contract code size over limit', yo`<div>Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fails. <br>
    //   More info: <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-170.md" target="_blank">eip-170</a>
    //   </div>`,
    //   {
    //     label: 'Force Send',
    //     fn: () => {
    //       this.deployContract(selectedContract, args, contractMetadata, compilerContracts, { continueCb, promptCb, statusCb, finalCb }, confirmationCb)
    //     }
    //   }, {
    //     label: 'Cancel',
    //     fn: () => {
    //       this.logCallback(`creation of ${selectedContract.name} canceled by user.`)
    //     }
    //   })
    // }
    // this.deployContract(selectedContract, args, contractMetadata, compilerContracts, { continueCb, promptCb, statusCb, finalCb }, confirmationCb)
  }

  //   listenToContextChange () {
  //     this.blockchain.event.register('networkStatus', ({ error, network }) => {
  //       if (error) {
  //         console.log('can\'t detect network')
  //         return
  //       }
  //       this.exEnvironment = this.blockchain.getProvider()
  //       this.networkName = network.name

  //       const savedConfig = window.localStorage.getItem(`ipfs/${this.exEnvironment}/${this.networkName}`)

  //       // check if an already selected option exist else use default workflow
  //       if (savedConfig !== null) {
  //         this.setCheckedState(savedConfig)
  //       } else {
  //         this.setCheckedState(this.networkName === 'Main')
  //       }
  //     })
  //   }

  //   async createInstance (selectedContract, args) {
  //     if (selectedContract.bytecodeObject.length === 0) {
  //       return modalDialogCustom.alert('This contract may be abstract, not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
  //     }

  //     var continueCb = (error, continueTxExecution, cancelCb) => {
  //       if (error) {
  //         var msg = typeof error !== 'string' ? error.message : error
  //         modalDialog('Gas estimation failed', yo`<div>Gas estimation errored with the following message (see below).
  //         The transaction execution will likely fail. Do you want to force sending? <br>
  //         ${msg}
  //         </div>`,
  //         {
  //           label: 'Send Transaction',
  //           fn: () => {
  //             continueTxExecution()
  //           }
  //         }, {
  //           label: 'Cancel Transaction',
  //           fn: () => {
  //             cancelCb()
  //           }
  //         })
  //       } else {
  //         continueTxExecution()
  //       }
  //     }

  //     const self = this

  //     var promptCb = (okCb, cancelCb) => {
  //       modalDialogCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
  //     }

  //     var statusCb = (msg) => {
  //       return this.logCallback(msg)
  //     }

  //     var finalCb = (error, contractObject, address) => {
  //       self.event.trigger('clearInstance')

  //       if (error) {
  //         return this.logCallback(error)
  //       }
  //       self.event.trigger('newContractInstanceAdded', [contractObject, address, contractObject.name])

  //       const data = self.runView.compilersArtefacts.getCompilerAbstract(contractObject.contract.file)
  //       self.runView.compilersArtefacts.addResolvedContract(helper.addressToString(address), data)
  //       if (self.ipfsCheckedState) {
  //         _paq.push(['trackEvent', 'udapp', 'DeployAndPublish', this.networkName])
  //         publishToStorage('ipfs', self.runView.fileProvider, self.runView.fileManager, selectedContract)
  //       } else {
  //         _paq.push(['trackEvent', 'udapp', 'DeployOnly', this.networkName])
  //       }
  //     }

  //     let contractMetadata
  //     try {
  //       contractMetadata = await this.runView.call('compilerMetadata', 'deployMetadataOf', selectedContract.name, selectedContract.contract.file)
  //     } catch (error) {
  //       return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
  //     }

  //     const compilerContracts = this.dropdownLogic.getCompilerContracts()
  //     const confirmationCb = this.getConfirmationCb(modalDialog, confirmDialog)

  //     if (selectedContract.isOverSizeLimit()) {
  //       return modalDialog('Contract code size over limit', yo`<div>Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fails. <br>
  //       More info: <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-170.md" target="_blank">eip-170</a>
  //       </div>`,
  //       {
  //         label: 'Force Send',
  //         fn: () => {
  //           this.deployContract(selectedContract, args, contractMetadata, compilerContracts, { continueCb, promptCb, statusCb, finalCb }, confirmationCb)
  //         }
  //       }, {
  //         label: 'Cancel',
  //         fn: () => {
  //           this.logCallback(`creation of ${selectedContract.name} canceled by user.`)
  //         }
  //       })
  //     }
  //     this.deployContract(selectedContract, args, contractMetadata, compilerContracts, { continueCb, promptCb, statusCb, finalCb }, confirmationCb)
  //   }

  //   deployContract (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
  //     _paq.push(['trackEvent', 'udapp', 'DeployContractTo', this.networkName])
  //     const { statusCb } = callbacks
  //     if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
  //       return this.blockchain.deployContractAndLibraries(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
  //     }
  //     if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
  //     this.blockchain.deployContractWithLibrary(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
  //   }

  //   getConfirmationCb (modalDialog, confirmDialog) {
  //     // this code is the same as in recorder.js. TODO need to be refactored out
  //     const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
  //       if (network.name !== 'Main') {
  //         return continueTxExecution(null)
  //       }
  //       const amount = this.blockchain.fromWei(tx.value, true, 'ether')
  //       const content = confirmDialog(tx, network, amount, gasEstimation, this.blockchain.determineGasFees(tx), this.blockchain.determineGasPrice.bind(this.blockchain))

  //       modalDialog('Confirm transaction', content,
  //         {
  //           label: 'Confirm',
  //           fn: () => {
  //             this.blockchain.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
  //             // TODO: check if this is check is still valid given the refactor
  //             if (!content.gasPriceStatus) {
  //               cancelCb('Given transaction fee is not correct')
  //             } else {
  //               continueTxExecution(content.txFee)
  //             }
  //           }
  //         }, {
  //           label: 'Cancel',
  //           fn: () => {
  //             return cancelCb('Transaction canceled by user.')
  //           }
  //         }
  //       )
  //     }

  //     return confirmationCb
  //   }

  const atAddressChanged = (event) => {
    const value = event.target.value

    if (!value) {
      enableAtAddress(false)
    } else {
      if ((!contractOptions.disabled && loadType === 'sol') ||
        loadType === 'abi') {
        enableAtAddress(true)
      } else {
        enableAtAddress(false)
      }
    }
    setAddress(value)
  }

  const loadFromAddress = () => {
    // trigger dispatchLoadAddress
    // this.event.trigger('clearInstance')

    // let address = this.atAddressButtonInput.value
    // if (!ethJSUtil.isValidChecksumAddress(address)) {
    //   addTooltip(yo`
    //     <span>
    //       It seems you are not using a checksumed address.
    //       <br>A checksummed address is an address that contains uppercase letters, as specified in <a href="https://eips.ethereum.org/EIPS/eip-55" target="_blank">EIP-55</a>.
    //       <br>Checksummed addresses are meant to help prevent users from sending transactions to the wrong address.
    //     </span>`)
    //   address = ethJSUtil.toChecksumAddress(address)
    // }
    // this.dropdownLogic.loadContractFromAddress(address,
    //   (cb) => {
    //     modalDialogCustom.confirm('At Address', `Do you really want to interact with ${address} using the current ABI definition?`, cb)
    //   },
    //   (error, loadType, abi) => {
    //     if (error) {
    //       return modalDialogCustom.alert(error)
    //     }
    //     if (loadType === 'abi') {
    //       return this.event.trigger('newContractABIAdded', [abi, address])
    //     }
    //     var selectedContract = this.getSelectedContract()
    //     this.event.trigger('newContractInstanceAdded', [selectedContract.object, address, this.selectContractNames.value])
    //   }
    // )
  }

  const handleCheckedIPFS = () => {
    setIpfsCheckedState(!ipfsCheckedState)
    window.localStorage.setItem(`ipfs/${props.exEnvironment}/${networkName}`, ipfsCheckedState.toString())
  }

  const handleContractChange = (e) => {
    const value = e.target.value

    setSelectedContract(value)
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
              <ContractGUI title='Deploy' funcABI={loadedContractData.getConstructorInterface()} clickCallBack={clickCallback} inputs={loadedContractData.getConstructorInputs()} widthClass='w-50' evmBC={loadedContractData.bytecodeObject} lookupOnly={false} />
              <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
                <input
                  id="deployAndRunPublishToIPFS"
                  data-id="contractDropdownIpfsCheckbox"
                  className="form-check-input custom-control-input"
                  type="checkbox"
                  onChange={handleCheckedIPFS}
                  checked={ipfsCheckedState}
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
          <button className="udapp_atAddress btn btn-sm btn-info" id="runAndDeployAtAdressButton" disabled={atAddressOptions.disabled} onClick={loadFromAddress}>At Address</button>
          <input
            className="udapp_input udapp_ataddressinput ataddressinput form-control"
            placeholder="Load contract from Address"
            title="address of contract"
            onChange={atAddressChanged}
            disabled={atAddressOptions.disabled}
          />
        </div>
      </div>
    </div>
    // this.selectContractNames.addEventListener('change', this.setInputParamsPlaceHolder.bind(this))
    // this.setInputParamsPlaceHolder()
  )
}
