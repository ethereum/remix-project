// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import * as remixLib from '@remix-project/remix-lib'
import { ContractGUIProps } from '../types'
import { CopyToClipboard } from '@remix-ui/clipboard'

const txFormat = remixLib.execution.txFormat
export function ContractGUI (props: ContractGUIProps) {
  const [title, setTitle] = useState<string>('')
  const [basicInput, setBasicInput] = useState<string>('')
  const [toggleContainer, setToggleContainer] = useState<boolean>(false)
  const [buttonOptions, setButtonOptions] = useState<{
    title: string,
    content: string,
    classList: string,
    dataId: string
  }>({ title: '', content: '', classList: '', dataId: '' })
  const multiFields = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (props.title) {
      setTitle(props.title)
    } else if (props.funcABI.name) {
      setTitle(props.funcABI.name)
    } else {
      setTitle(props.funcABI.type === 'receive' ? '(receive)' : '(fallback)')
    }
  }, [props.title, props.funcABI])

  useEffect(() => {
    if (props.lookupOnly) {
    //   // call. stateMutability is either pure or view
      setButtonOptions({
        title: title + ' - call',
        content: 'call',
        classList: 'btn-info',
        dataId: title + ' - call'
      })
    } else if (props.funcABI.stateMutability === 'payable' || props.funcABI.payable) {
    //   // transact. stateMutability = payable
      setButtonOptions({
        title: title + ' - transact (payable)',
        content: 'transact',
        classList: 'btn-danger',
        dataId: title + ' - transact (payable)'
      })
    } else {
    //   // transact. stateMutability = nonpayable
      setButtonOptions({
        title: title + ' - transact (not payable)',
        content: 'transact',
        classList: 'btn-warning',
        dataId: title + ' - transact (not payable)'
      })
    }
  }, [props.lookupOnly, props.funcABI, title])

  const getContentOnCTC = () => {
    const multiString = getMultiValsString()
    // copy-to-clipboard icon is only visible for method requiring input params
    if (!multiString) {
      return 'cannot encode empty arguments'
    }
    const multiJSON = JSON.parse('[' + multiString + ']')
    const encodeObj = txFormat.encodeData(props.funcABI, multiJSON, null)
    if (encodeObj.error) {
      console.error(encodeObj.error)
      return encodeObj.error
    } else {
      return encodeObj.data
    }
  }

  const switchMethodViewOn = () => {
    setToggleContainer(true)
    makeMultiVal()
  }

  const switchMethodViewOff = () => {
    setToggleContainer(false)
    const multiValString = getMultiValsString()

    if (multiValString) setBasicInput(multiValString)
  }

  const getMultiValsString = () => {
    const valArray = multiFields.current
    let ret = ''
    const valArrayTest = []

    for (let j = 0; j < valArray.length; j++) {
      if (ret !== '') ret += ','
      let elVal = valArray[j] ? valArray[j].value : ''

      valArrayTest.push(elVal)
      elVal = elVal.replace(/(^|,\s+|,)(\d+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted number by quoted number
      elVal = elVal.replace(/(^|,\s+|,)(0[xX][0-9a-fA-F]+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted hex string by quoted hex string
      if (elVal) {
        try {
          JSON.parse(elVal)
        } catch (e) {
          elVal = '"' + elVal + '"'
        }
      }
      ret += elVal
    }
    const valStringTest = valArrayTest.join('')

    if (valStringTest) {
      return ret
    } else {
      return ''
    }
  }

  const makeMultiVal = () => {
    let inputString = basicInput

    if (inputString) {
      inputString = inputString.replace(/(^|,\s+|,)(\d+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted number by quoted number
      inputString = inputString.replace(/(^|,\s+|,)(0[xX][0-9a-fA-F]+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted hex string by quoted hex string
      const inputJSON = JSON.parse('[' + inputString + ']')
      const multiInputs = multiFields.current

      for (let k = 0; k < multiInputs.length; k++) {
        if (inputJSON[k]) {
          multiInputs[k].value = JSON.stringify(inputJSON[k])
        }
      }
    }
  }

  const handleActionClick = () => {
    props.clickCallBack(props.funcABI.inputs, basicInput)
  }

  const handleBasicInput = (e) => {
    const value = e.target.value

    setBasicInput(value)
  }

  const handleExpandMultiClick = () => {
    const valsString = getMultiValsString()

    if (valsString) {
      props.clickCallBack(props.funcABI.inputs, valsString)
    } else {
      props.clickCallBack(props.funcABI.inputs, '')
    }
  }

  return (
    <div className={`udapp_contractProperty ${(props.funcABI.inputs && props.funcABI.inputs.length > 0) || (props.funcABI.type === 'fallback') || (props.funcABI.type === 'receive') ? 'udapp_hasArgs' : ''}`}>
      <div className="udapp_contractActionsContainerSingle pt-2" style={{ display: toggleContainer ? 'none' : 'flex' }}>
        <button onClick={handleActionClick} title={buttonOptions.title} className={`udapp_instanceButton ${props.widthClass} btn btn-sm ${buttonOptions.classList}`} data-id={buttonOptions.dataId}>{title}</button>
        <input
          className="form-control"
          data-id={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : 'multiParamManagerBasicInputField'}
          placeholder={props.inputs}
          title={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}
          onChange={handleBasicInput}
          style={{ visibility: !((props.funcABI.inputs && props.funcABI.inputs.length > 0) || (props.funcABI.type === 'fallback') || (props.funcABI.type === 'receive')) ? 'hidden' : 'visible' }} />
        <i
          className="fas fa-angle-down udapp_methCaret"
          onClick={switchMethodViewOn}
          title={title}
          style={{ visibility: !(props.funcABI.inputs && props.funcABI.inputs.length > 0) ? 'hidden' : 'visible' }}></i>
      </div>
      <div className="udapp_contractActionsContainerMulti" style={{ display: toggleContainer ? 'flex' : 'none' }}>
        <div className="udapp_contractActionsContainerMultiInner text-dark">
          <div onClick={switchMethodViewOff} className="udapp_multiHeader">
            <div className="udapp_multiTitle run-instance-multi-title">{title}</div>
            <i className='fas fa-angle-up udapp_methCaret'></i>
          </div>
          <div>
            {props.funcABI.inputs.map((inp, index) => {
              return (
                <div className="udapp_multiArg" key={index}>
                  <label htmlFor={inp.name}> {inp.name}: </label>
                  <input ref={el => { multiFields.current[index] = el }} className="form-control" placeholder={inp.type} title={inp.name} data-id={`multiParamManagerInput${inp.name}`} />
                </div>)
            })}
          </div>
          <div className="udapp_group udapp_multiArg">
            <CopyToClipboard tip='Encode values of input fields & copy to clipboard' icon='fa-clipboard' direction={'left'} getContent={getContentOnCTC} />
            <button onClick={handleExpandMultiClick} title={buttonOptions.title} data-id={buttonOptions.dataId} className={`udapp_instanceButton ${buttonOptions.classList}`}>{ buttonOptions.content }</button>
          </div>
        </div>
      </div>
    </div>
  )
}
