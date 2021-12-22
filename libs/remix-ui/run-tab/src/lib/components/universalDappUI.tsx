// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import { shortenAddress } from 'apps/remix-ide/src/lib/helper'
import { FuncABI, UdappProps } from '../types'
import { CopyToClipboard } from '@remix-ui/clipboard'
import * as remixLib from '@remix-project/remix-lib'
import * as ethJSUtil from 'ethereumjs-util'
import { ContractGUI } from './contractGUI'

const txHelper = remixLib.execution.txHelper

export function UniversalDappUI (props: UdappProps) {
  const [toggleExpander, setToggleExpander] = useState<boolean>(true)
  const [contractABI, setContractABI] = useState<FuncABI[]>(null)
  const [address, setAddress] = useState<string>('')

  useEffect(() => {
    if (!props.abi) {
      const abi = txHelper.sortAbiFunction(props.instance.contractData.abi)

      setContractABI(abi)
    } else {
      setContractABI(props.abi)
    }
  }, [props.abi])

  useEffect(() => {
    if (props.instance.address) {
      // @ts-ignore
      let address = (props.instance.address.slice(0, 2) === '0x' ? '' : '0x') + props.instance.address.toString('hex')

      address = ethJSUtil.toChecksumAddress(address)
      setAddress(address)
    }
  }, [props.instance.address])

  // const calldataInput = yo`
  //   <input id="deployAndRunLLTxCalldata" class="${css.calldataInput} form-control" title="The Calldata to send to fallback function of the contract.">
  // `
  // const llIError = yo`
  //   <label id="deployAndRunLLTxError" class="text-danger my-2"></label>
  // `
  // // constract LLInteractions elements
  // const lowLevelInteracions = yo`
  //   <div class="d-flex flex-column">
  //     <div class="d-flex flex-row justify-content-between mt-2">
  //       <div class="py-2 border-top d-flex justify-content-start flex-grow-1">
  //         Low level interactions
  //       </div>
  //       <a
  //         href="https://solidity.readthedocs.io/en/v0.6.2/contracts.html#receive-ether-function"
  //         title="check out docs for using 'receive'/'fallback'"
  //         target="_blank"
  //       >
  //         <i aria-hidden="true" class="fas fa-info my-2 mr-1"></i>
  //       </a>
  //     </div>
  //     <div class="d-flex flex-column align-items-start">
  //       <label class="">CALLDATA</label>
  //       <div class="d-flex justify-content-end w-100 align-items-center">
  //         ${calldataInput}
  //         <button id="deployAndRunLLTxSendTransaction" data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction" class="${css.instanceButton} p-0 w-50 btn border-warning text-warning" title="Send data to contract." onclick=${() => sendData()}>Transact</button>
  //       </div>
  //     </div>
  //     <div>
  //       ${llIError}
  //     </div>
  //   </div>
  // `

  // function sendData () {
  //   function setLLIError (text) {
  //     llIError.innerText = text
  //   }

  //   setLLIError('')
  //   const fallback = txHelper.getFallbackInterface(contractABI)
  //   const receive = txHelper.getReceiveInterface(contractABI)
  //   const args = {
  //     funABI: fallback || receive,
  //     address: address,
  //     contractName: contractName,
  //     contractABI: contractABI
  //   }
  //   const amount = document.querySelector('#value').value
  //   if (amount !== '0') {
  //     // check for numeric and receive/fallback
  //     if (!helper.isNumeric(amount)) {
  //       return setLLIError('Value to send should be a number')
  //     } else if (!receive && !(fallback && fallback.stateMutability === 'payable')) {
  //       return setLLIError("In order to receive Ether transfer the contract should have either 'receive' or payable 'fallback' function")
  //     }
  //   }
  //   let calldata = calldataInput.value
  //   if (calldata) {
  //     if (calldata.length < 4 && helper.is0XPrefixed(calldata)) {
  //       return setLLIError('The calldata should be a valid hexadecimal value with size of at least one byte.')
  //     } else {
  //       if (helper.is0XPrefixed(calldata)) {
  //         calldata = calldata.substr(2, calldata.length)
  //       }
  //       if (!helper.isHexadecimal(calldata)) {
  //         return setLLIError('The calldata should be a valid hexadecimal value.')
  //       }
  //     }
  //     if (!fallback) {
  //       return setLLIError("'Fallback' function is not defined")
  //     }
  //   }

  //   if (!receive && !fallback) return setLLIError('Both \'receive\' and \'fallback\' functions are not defined')

  //   // we have to put the right function ABI:
  //   // if receive is defined and that there is no calldata => receive function is called
  //   // if fallback is defined => fallback function is called
  //   if (receive && !calldata) args.funABI = receive
  //   else if (fallback) args.funABI = fallback

  //   if (!args.funABI) return setLLIError('Please define a \'Fallback\' function to send calldata and a either \'Receive\' or payable \'Fallback\' to send ethers')
  //   self.runTransaction(false, args, null, calldataInput.value, null)
  // }

  // contractActionsWrapper.appendChild(lowLevelInteracions)
  // return instance

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  const remove = () => {
    props.removeInstance(props.index)
  }

  const runTransaction = (lookupOnly, funcABI: FuncABI, valArr, inputsValues) => {
    const functionName = funcABI.type === 'function' ? funcABI.name : `(${funcABI.type})`
    const logMsg = `${lookupOnly ? 'call' : 'transact'} to ${props.instance.name}.${functionName}`

    // const callbacksInContext = txCallBacks.getCallBacksWithContext(this, this.blockchain)

    // const outputCb = (returnValue) => {
    //   if (outputOverride) {
    //     const decoded = decodeResponseToTreeView(returnValue, args.funABI)
    //     outputOverride.innerHTML = ''
    //     outputOverride.appendChild(decoded)
    //   }
    // }
    // let callinfo = ''
    // if (lookupOnly) callinfo = 'call'
    // else if (args.funABI.type === 'fallback' || args.funABI.type === 'receive') callinfo = 'lowLevelInteracions'
    // else callinfo = 'transact'

    // _paq.push(['trackEvent', 'udapp', callinfo, this.blockchain.getCurrentNetworkStatus().network.name])
    // const params = args.funABI.type !== 'fallback' ? inputsValues : ''
    // this.blockchain.runOrCallContractMethod(
    //   args.contractName,
    //   args.contractABI,
    //   args.funABI,
    //   args.contract,
    //   inputsValues,
    //   args.address,
    //   params,
    //   lookupOnly,
    //   logMsg,
    //   this.logCallback,
    //   outputCb,
    //   callbacksInContext.confirmationCb.bind(callbacksInContext),
    //   callbacksInContext.continueCb.bind(callbacksInContext),
    //   callbacksInContext.promptCb.bind(callbacksInContext))
  }

  return (
    <div className={`udapp_instance udapp_run-instance border-dark ${toggleExpander ? 'udapp_hidesub' : ''}`} id={`instance${address}`} data-shared="universalDappUiInstance">
      <div className="udapp_title alert alert-secondary">
        <button data-id="universalDappUiTitleExpander" className="btn udapp_titleExpander" onClick={toggleClass}>
          <i className={`fas ${toggleExpander ? 'fa-angle-right' : 'fa-angle-down'}`} aria-hidden="true"></i>
        </button>
        <div className="input-group udapp_nameNbuts">
          <div className="udapp_titleText input-group-prepend">
            <span className="input-group-text udapp_spanTitleText">
              {props.instance.name} at {shortenAddress(address)} ({props.context})
            </span>
          </div>
          <div className="btn-group">
            <button className="btn p-1 btn-secondary"><CopyToClipboard content={address} /></button>
          </div>
        </div>
        <button
          className="udapp_udappClose mr-1 p-1 btn btn-secondary align-items-center"
          data-id="universalDappUiUdappClose"
          onClick={remove}
          title="Remove from the list"
        >
          <i className="udapp_closeIcon fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div className="udapp_cActionsWrapper" data-id="universalDappUiContractActionWrapper">
        {
          contractABI && contractABI.map((funcABI) => {
            if (funcABI.type !== 'function') return null
            const isConstant = funcABI.constant !== undefined ? funcABI.constant : false
            const lookupOnly = funcABI.stateMutability === 'view' || funcABI.stateMutability === 'pure' || isConstant

            return <div className="udapp_value">
              <ContractGUI funcABI={funcABI} clickCallBack={(valArray: { name: string, type: string }[], inputsValues: string) => runTransaction(lookupOnly, funcABI, valArray, inputsValues)} inputs={props.instance.contractData.getConstructorInputs()} evmBC={props.instance.contractData.bytecodeObject} lookupOnly={lookupOnly} />
            </div>
          })
        }
      </div>
    </div>
  )
}
