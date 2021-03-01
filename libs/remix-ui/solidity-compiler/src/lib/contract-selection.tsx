import React, { useState, useEffect } from 'react' // eslint-disable-line
import { ContractSelectionProps } from './types'

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

  return (
    // define swarm logo
    <>
    { state.contractList.length ?
    <section className="remixui_compilerSection pt-3">
        {/* Select Compiler Version */}
        <div className="mb-3">
          <label className="remixui_compilerLabel form-check-label" htmlFor="compiledContracts">Contract</label>
          <select
          onChange={(e) => selectContract(e.target.value)}
          data-id="compiledContracts" id="compiledContracts" className="custom-select"
        >
          {state.contractList.map(({ name, file }) => <option value={name}>{name} ({file})</option>)}
        </select>
        </div>
        <article className="mt-2 pb-0">
          <button id="publishOnSwarm" className="btn btn-secondary btn-block" title="Publish on Swarm" onClick={() => { publishToStorage('swarm', this.fileProvider, this.fileManager, this.data.contractsDetails[this.selectedContract]) }}>
            <span>Publish on Swarm</span>
            <img id="swarmLogo" class="${css.storageLogo} ml-2" src="assets/img/swarm.webp">
          </button>
          <button id="publishOnIpfs" class="btn btn-secondary btn-block" title="Publish on Ipfs" onclick="${() => { publishToStorage('ipfs', this.fileProvider, this.fileManager, this.data.contractsDetails[this.selectedContract]) }}">
          <span>Publish on Ipfs</span>
          <img id="ipfsLogo" class="${css.storageLogo} ml-2" src="assets/img/ipfs.webp">
        </button>
          <button data-id="compilation-details" class="btn btn-secondary btn-block" title="Display Contract Details" onclick="${() => { this.details() }}">
            Compilation Details
          </button>
          <!-- Copy to Clipboard -->
          <div class="${css.contractHelperButtons}">
            <div class="input-group">
              <div class="btn-group" role="group" aria-label="Copy to Clipboard">
                <button class="btn ${css.copyButton}" title="Copy ABI to clipboard" onclick="${() => { this.copyABI() }}">
                  <i class="${css.copyIcon} far fa-copy" aria-hidden="true"></i>
                  <span>ABI</span>
                </button>
                <button class="btn ${css.copyButton}" title="Copy Bytecode to clipboard" onclick="${() => { this.copyBytecode() }}">
                  <i class="${css.copyIcon} far fa-copy" aria-hidden="true"></i>
                  <span>Bytecode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> : <section class="${css.container} clearfix"><article class="px-2 mt-2 pb-0 d-flex">
        <span class="mt-2 mx-3 w-100 alert alert-warning" role="alert">No Contract Compiled Yet</span>
      </article></section>
      }
      </>
  
      if (contractList.length) {
        this.selectedContract = selectEl.value
      } else {
        delete this.selectedContract
      }
      return result

      return ()
}

export default ContractSelection
