// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import { UdappProps } from '../types'
import { FuncABI } from '@remix-project/core-plugin'
import { CopyToClipboard } from '@remix-ui/clipboard'
import * as remixLib from '@remix-project/remix-lib'
import * as ethJSUtil from 'ethereumjs-util'
import { ContractGUI } from './contractGUI'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import { BN } from 'ethereumjs-util'
import { is0XPrefixed, isHexadecimal, isNumeric, shortenAddress } from '@remix-ui/helper'

const txHelper = remixLib.execution.txHelper

export function UniversalDappUI (props: UdappProps) {
  const [toggleExpander, setToggleExpander] = useState<boolean>(true)
  const [contractABI, setContractABI] = useState<FuncABI[]>(null)
  const [address, setAddress] = useState<string>('')
  const [expandPath, setExpandPath] = useState<string[]>([])
  const [llIError, setLlIError] = useState<string>('')
  const [calldataValue, setCalldataValue] = useState<string>('')
  const [evmBC, setEvmBC] = useState(null)

  useEffect(() => {
    if (!props.instance.abi) {
      const abi = txHelper.sortAbiFunction(props.instance.contractData.abi)

      setContractABI(abi)
    } else {
      setContractABI(props.instance.abi)
    }
  }, [props.instance.abi])

  useEffect(() => {
    if (props.instance.address) {
      // @ts-ignore
      let address = (props.instance.address.slice(0, 2) === '0x' ? '' : '0x') + props.instance.address.toString('hex')

      address = ethJSUtil.toChecksumAddress(address)
      setAddress(address)
    }
  }, [props.instance.address])

  useEffect(() => {
    if (props.instance.contractData) {
      setEvmBC(props.instance.contractData.bytecodeObject)
    }
  }, [props.instance.contractData])

  const sendData = () => {
    setLlIError('')
    const fallback = txHelper.getFallbackInterface(contractABI)
    const receive = txHelper.getReceiveInterface(contractABI)
    const args = {
      funcABI: fallback || receive,
      address: address,
      contractName: props.instance.name,
      contractABI: contractABI
    }
    const amount = props.sendValue

    if (amount !== '0') {
      // check for numeric and receive/fallback
      if (!isNumeric(amount)) {
        return setLlIError('Value to send should be a number')
      } else if (!receive && !(fallback && fallback.stateMutability === 'payable')) {
        return setLlIError("In order to receive Ether transfer the contract should have either 'receive' or payable 'fallback' function")
      }
    }
    let calldata = calldataValue

    if (calldata) {
      if (calldata.length < 4 && is0XPrefixed(calldata)) {
        return setLlIError('The calldata should be a valid hexadecimal value with size of at least one byte.')
      } else {
        if (is0XPrefixed(calldata)) {
          calldata = calldata.substr(2, calldata.length)
        }
        if (!isHexadecimal(calldata)) {
          return setLlIError('The calldata should be a valid hexadecimal value.')
        }
      }
      if (!fallback) {
        return setLlIError("'Fallback' function is not defined")
      }
    }

    if (!receive && !fallback) return setLlIError('Both \'receive\' and \'fallback\' functions are not defined')

    // we have to put the right function ABI:
    // if receive is defined and that there is no calldata => receive function is called
    // if fallback is defined => fallback function is called
    if (receive && !calldata) args.funcABI = receive
    else if (fallback) args.funcABI = fallback

    if (!args.funcABI) return setLlIError('Please define a \'Fallback\' function to send calldata and a either \'Receive\' or payable \'Fallback\' to send ethers')
    runTransaction(false, args.funcABI, null, calldataValue)
  }

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  const remove = () => {
    props.removeInstance(props.index)
  }

  const runTransaction = (lookupOnly, funcABI: FuncABI, valArr, inputsValues, funcIndex?: number) => {
    const functionName = funcABI.type === 'function' ? funcABI.name : `(${funcABI.type})`
    const logMsg = `${lookupOnly ? 'call' : 'transact'} to ${props.instance.name}.${functionName}`

    props.runTransactions(
      props.index,
      lookupOnly,
      funcABI,
      inputsValues,
      props.instance.name,
      contractABI,
      props.instance.contractData,
      address,
      logMsg,
      props.mainnetPrompt,
      props.gasEstimationPrompt,
      props.passphrasePrompt,
      funcIndex)
  }

  const extractDataDefault = (item, parent?) => {
    const ret: any = {}

    if (BN.isBN(item)) {
      ret.self = item.toString(10)
      ret.children = []
    } else {
      if (item instanceof Array) {
        ret.children = item.map((item, index) => {
          return { key: index, value: item }
        })
        ret.self = 'Array'
        ret.isNode = true
        ret.isLeaf = false
      } else if (item instanceof Object) {
        ret.children = Object.keys(item).map((key) => {
          return { key: key, value: item[key] }
        })
        ret.self = 'Object'
        ret.isNode = true
        ret.isLeaf = false
      } else {
        ret.self = item
        ret.children = null
        ret.isNode = false
        ret.isLeaf = true
      }
    }
    return ret
  }

  const handleExpand = (path: string) => {
    if (expandPath.includes(path)) {
      const filteredPath = expandPath.filter(value => value !== path)

      setExpandPath(filteredPath)
    } else {
      setExpandPath([...expandPath, path])
    }
  }

  const handleCalldataChange = (e) => {
    const value = e.target.value

    setCalldataValue(value)
  }

  const label = (key: string | number, value: string) => {
    return (
      <div className="d-flex mt-2 flex-row label_item">
        <label className="small font-weight-bold mb-0 pr-1 label_key">{key}:</label>
        <label className="m-0 label_value">{value}</label>
      </div>
    )
  }

  const renderData = (item, parent, key: string | number, keyPath: string) => {
    const data = extractDataDefault(item, parent)
    const children = (data.children || []).map((child, index) => {
      return (
        renderData(child.value, data, child.key, keyPath + '/' + child.key)
      )
    })

    if (children && children.length > 0) {
      return (
        <TreeViewItem id={`treeViewItem${key}`} key={keyPath} label={label(key, data.self)} onClick={() => handleExpand(keyPath)} expand={expandPath.includes(keyPath)}>
          <TreeView id={`treeView${key}`} key={keyPath}>
            {children}
          </TreeView>
        </TreeViewItem>
      )
    } else {
      return <TreeViewItem id={key.toString()} key={keyPath} label={label(key, data.self)} onClick={() => handleExpand(keyPath)} expand={expandPath.includes(keyPath)} />
    }
  }

  return (
    <div className={`instance udapp_instance udapp_run-instance border-dark ${toggleExpander ? 'udapp_hidesub' : 'bg-light'}`} id={`instance${address}`} data-shared="universalDappUiInstance">
      <div className="udapp_title alert alert-secondary">
        <span data-id={`universalDappUiTitleExpander${props.index}`} className="btn udapp_titleExpander" onClick={toggleClass}>
          <i className={`fas ${toggleExpander ? 'fa-angle-right' : 'fa-angle-down'}`} aria-hidden="true"></i>
        </span>
        <div className="input-group udapp_nameNbuts">
          <div className="udapp_titleText input-group-prepend">
            <span className="input-group-text udapp_spanTitleText">
              {props.instance.name} at {shortenAddress(address)} ({props.context})
            </span>
          </div>
          <div className="btn-group">
            <button className="btn p-1 btn-secondary"><CopyToClipboard content={address} direction={'top'} /></button>
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
        <div className="udapp_contractActionsContainer">
          {
            contractABI && contractABI.map((funcABI, index) => {
              if (funcABI.type !== 'function') return null
              const isConstant = funcABI.constant !== undefined ? funcABI.constant : false
              const lookupOnly = funcABI.stateMutability === 'view' || funcABI.stateMutability === 'pure' || isConstant
              const inputs = props.getFuncABIInputs(funcABI)

              return <div key={index}>
                <ContractGUI
                  funcABI={funcABI}
                  clickCallBack={(valArray: { name: string, type: string }[], inputsValues: string) => {
                    runTransaction(lookupOnly, funcABI, valArray, inputsValues, index)
                  }}
                  inputs={inputs}
                  evmBC={evmBC}
                  lookupOnly={lookupOnly}
                  key={index}
                />
                <div className="udapp_value" data-id="udapp_value">
                  <TreeView id="treeView">
                    {
                      Object.keys(props.instance.decodedResponse || {}).map((key) => {
                        const funcIndex = index.toString()
                        const response = props.instance.decodedResponse[key]

                        return key === funcIndex ? Object.keys(response || {}).map((innerkey, index) => {
                          return renderData(props.instance.decodedResponse[key][innerkey], response, innerkey, innerkey)
                        }) : null
                      })
                    }
                  </TreeView>
                </div>
              </div>
            })
          }
        </div>
        <div className="d-flex flex-column">
          <div className="d-flex flex-row justify-content-between mt-2">
            <div className="py-2 border-top d-flex justify-content-start flex-grow-1">
              Low level interactions
            </div>
            <a
              href="https://solidity.readthedocs.io/en/v0.6.2/contracts.html#receive-ether-function"
              title="check out docs for using 'receive'/'fallback'"
              target="_blank" rel="noreferrer"
            >
              <i aria-hidden="true" className="fas fa-info my-2 mr-1"></i>
            </a>
          </div>
          <div className="d-flex flex-column align-items-start">
            <label className="">CALLDATA</label>
            <div className="d-flex justify-content-end w-100 align-items-center">
              <input id="deployAndRunLLTxCalldata" onChange={handleCalldataChange} className="udapp_calldataInput form-control" title="The Calldata to send to fallback function of the contract." />
              <button id="deployAndRunLLTxSendTransaction" data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction" className="udapp_instanceButton p-0 w-50 btn border-warning text-warning" title="Send data to contract." onClick={sendData}>Transact</button>
            </div>
          </div>
          <div>
            <label id="deployAndRunLLTxError" className="text-danger my-2">{ llIError }</label>
          </div>
        </div>
      </div>
    </div>
  )
}
