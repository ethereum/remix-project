import React, { useState, useEffect } from 'react' // eslint-disable-line
import { ContractSelectionProps } from './types'
import { PublishToStorage } from '@remix-ui/publish-to-storage'

import './css/style.css'

export const ContractSelection = (props: ContractSelectionProps) => {
  const { contractMap } = props
  const [state, setState] = useState({
    contractList: null,
    selectedContract: ''
  })

  useEffect(() => {
    const contractList = contractMap ? Object.keys(contractMap).map((key) => ({
      name: key,
      file: getFileName(contractMap[key].file)
    })) : []

    setState(prevState => {
      return { ...prevState, contractList }
    })
  }, [])
  // Return the file name of a path: ex "browser/ballot.sol" -> "ballot.sol"
  const getFileName = (path) => {
    const part = path.split('/')

    return part[part.length - 1]
  }

  const selectContract = (contractName: string) => {
    setState(prevState => {
      return { ...prevState, selectedContract: contractName }
    })
  }

  const handlePublishToStorage = (type) => {

  }

  const copyABI = () => {
    copyContractProperty('abi')
  }

  const copyContractProperty = (property) => {
    let content = getContractProperty(property)
    // if (!content) {
    //   addTooltip('No content available for ' + property)
    //   return
    // }

    // try {
    //   if (typeof content !== 'string') {
    //     content = JSON.stringify(content, null, '\t')
    //   }
    // } catch (e) {}

    // copy(content)
    // addTooltip('Copied value to clipboard')
  }
  
  const getContractProperty = (property) => {
    // if (!this.selectedContract) throw new Error('No contract compiled yet')
    // const contractProperties = this.data.contractsDetails[this.selectedContract]
    // return contractProperties[property] || null
  }

  const details = () => {
    const help = {
      Assembly: 'Assembly opcodes describing the contract including corresponding solidity source code',
      Opcodes: 'Assembly opcodes describing the contract',
      'Runtime Bytecode': 'Bytecode storing the state and being executed during normal contract call',
      bytecode: 'Bytecode being executed during contract creation',
      functionHashes: 'List of declared function and their corresponding hash',
      gasEstimates: 'Gas estimation for each function call',
      metadata: 'Contains all informations related to the compilation',
      metadataHash: 'Hash representing all metadata information',
      abi: 'ABI: describing all the functions (input/output params, scope, ...)',
      name: 'Name of the compiled contract',
      swarmLocation: 'Swarm url where all metadata information can be found (contract needs to be published first)',
      web3Deploy: 'Copy/paste this code to any JavaScript/Web3 console to deploy this contract'
    }
    if (!this.selectedContract) throw new Error('No contract compiled yet')
    const contractProperties = this.data.contractsDetails[this.selectedContract]
    const log = yo`<div class="${css.detailsJSON}"></div>`
    Object.keys(contractProperties).map(propertyName => {
      const copyDetails = yo`<span class="${css.copyDetails}">${copyToClipboard(() => contractProperties[propertyName])}</span>`
      const questionMark = yo`<span class="${css.questionMark}"><i title="${help[propertyName]}" class="fas fa-question-circle" aria-hidden="true"></i></span>`
      log.appendChild(yo`<div class=${css.log}>
        <div class="${css.key}">${propertyName} ${copyDetails} ${questionMark}</div>
        ${this.insertValue(contractProperties, propertyName)}
      </div>`)
    })
    modalDialog(this.selectedContract, log, { label: '' }, { label: 'Close' })
  }

  const copyBytecode = () => {
    copyContractProperty('bytecode')
  }

  return (
    // define swarm logo
    <>
      { state.contractList.length ?
        <section className="remixui_compilerSection pt-3">
          {/* Select Compiler Version */}
          <div className="mb-3">
            <label className="remixui_compilerLabel form-check-label" htmlFor="compiledContracts">Contract</label>
            <select onChange={(e) => selectContract(e.target.value)} data-id="compiledContracts" id="compiledContracts" className="custom-select">
              {state.contractList.map(({ name, file }) => <option value={name}>{name} ({file})</option>)}
            </select>
          </div>
          <article className="mt-2 pb-0">
            <button id="publishOnSwarm" className="btn btn-secondary btn-block" title="Publish on Swarm" onClick={() => { handlePublishToStorage('swarm')}}>
              <span>Publish on Swarm</span>
              <img id="swarmLogo" className="remixui_storageLogo ml-2" src="assets/img/swarm.webp" />
            </button>
            <button id="publishOnIpfs" className="btn btn-secondary btn-block" title="Publish on Ipfs" onClick={() => { handlePublishToStorage('ipfs') }}>
              <span>Publish on Ipfs</span>
              <img id="ipfsLogo" className="remixui_storageLogo} ml-2" src="assets/img/ipfs.webp" />
            </button>
            <button data-id="compilation-details" className="btn btn-secondary btn-block" title="Display Contract Details" onClick={() => { details() }}>
              Compilation Details
            </button>
            {/* Copy to Clipboard */}
            <div className="remixui_contractHelperButtons">
              <div className="input-group">
                <div className="btn-group" role="group" aria-label="Copy to Clipboard">
                  <button className="btn copyButton" title="Copy ABI to clipboard" onClick={() => { copyABI() }}>
                    <i className="remixui_copyIcon far fa-copy" aria-hidden="true"></i>
                    <span>ABI</span>
                  </button>
                  <button className="btn remixui_copyButton" title="Copy Bytecode to clipboard" onClick={() => { copyBytecode() }}>
                    <i className="remixui_copyIcon far fa-copy" aria-hidden="true"></i>
                    <span>Bytecode</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section> : <section className="remixui_container clearfix"><article className="px-2 mt-2 pb-0 d-flex">
          <span className="mt-2 mx-3 w-100 alert alert-warning" role="alert">No Contract Compiled Yet</span>
        </article></section>
      }
      <PublishToStorage />
    </>
  )

  // if (contractList.length) {
  //   this.selectedContract = selectEl.value
  // } else {
  //   delete this.selectedContract
  // }
  // return result

  // return ()
}

export default ContractSelection
