// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import * as remixLib from '@remix-project/remix-lib'
import { ContractGUIProps } from '../types'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { MultiDeployInput } from './multiDeployInput'
import { DeployInput } from './deployInput'

const txFormat = remixLib.execution.txFormat
export function ContractGUI (props: ContractGUIProps) {
  const [title, setTitle] = useState<string>('')
  const [basicInput, setBasicInput] = useState<string>('')
  const [toggleContainer, setToggleContainer] = useState<boolean>(false)
  const [buttonOptions, setButtonOptions] = useState<{
    title: string,
    content: string,
    classList: string,
    dataId: string,
    widthClass: string
  }>({ title: '', content: '', classList: '', dataId: '', widthClass: '' })
  const [selectedDeployIndex, setSelectedDeployIndex] = useState<number>(null)
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [hasArgs, setHasArgs] = useState<boolean>(false)
  const [isMultiField, setIsMultiField] = useState<boolean>(false)
  const [deployInputs, setDeployInputs] = useState<{
    internalType?: string,
    name: string,
    type: string
  }[]>([])
  const [deployPlaceholder, setDeployPlaceholder] = useState<string>('')
  const multiFields = useRef<Array<HTMLInputElement | null>>([])
  const basicInputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (props.title) {
      setTitle(props.title)
    } else if (props.funcABI.name) {
      setTitle(props.funcABI.name)
    } else {
      setTitle(props.funcABI.type === 'receive' ? '(receive)' : '(fallback)')
    }
    setBasicInput('')
    // we have the reset the fields before reseting the previous references.
    if (basicInputRef.current) basicInputRef.current.value = ''
    multiFields.current.filter((el) => el !== null && el !== undefined).forEach((el) => el.value = '')
    multiFields.current = []
  }, [props.title, props.funcABI])

  useEffect(() => {
    if (props.lookupOnly) {
    //   // call. stateMutability is either pure or view
      setButtonOptions({
        title: title + ' - call',
        content: 'call',
        classList: 'btn-info',
        dataId: title + ' - call',
        widthClass: props.widthClass
      })
    } else if (props.funcABI.stateMutability === 'payable' || props.funcABI.payable) {
    //   // transact. stateMutability = payable
      setButtonOptions({
        title: title + ' - transact (payable)',
        content: 'transact',
        classList: 'btn-danger',
        dataId: title + ' - transact (payable)',
        widthClass: props.widthClass
      })
    } else {
    //   // transact. stateMutability = nonpayable
      setButtonOptions({
        title: title + ' - transact (not payable)',
        content: 'transact',
        classList: 'btn-warning',
        dataId: title + ' - transact (not payable)',
        widthClass: props.widthClass
      })
    }
  }, [props.lookupOnly, props.funcABI, title])

  useEffect(() => {
    if (props.deployOption && props.deployOption[selectedDeployIndex]) {
      if (props.deployOption[selectedDeployIndex].title === 'Deploy with Proxy') {
        if (props.initializerOptions) {
          setDeployInputs(props.initializerOptions.inputs.inputs)
          setDeployPlaceholder(props.initializerOptions.initializeInputs)
          setHasArgs(true)
          if (props.initializerOptions.inputs.inputs.length > 1) setIsMultiField(true)
          else setIsMultiField(false)
        } else {
          setDeployInputs([])
          setDeployPlaceholder('')
          setHasArgs(false)
          setIsMultiField(false)
        }
      } else {
        if (props.funcABI) {
          setDeployInputs(props.funcABI.inputs)
          setDeployPlaceholder(props.inputs)
          setHasArgs(true)
          if (props.funcABI.inputs.length > 1) setIsMultiField(true)
          else setIsMultiField(false)
        } else {
          setDeployInputs([])
          setDeployPlaceholder('')
          setHasArgs(false)
          setIsMultiField(false)
        }
      }
    } else {
      if (props.funcABI) {
        setDeployInputs(props.funcABI.inputs)
        setDeployPlaceholder(props.inputs)
        setHasArgs(true)
        if (props.funcABI.inputs.length > 1) setIsMultiField(true)
        else setIsMultiField(false)
      } else {
        setDeployInputs([])
        setDeployPlaceholder('')
        setHasArgs(false)
        setIsMultiField(false)
      }
    }
  }, [selectedDeployIndex, props.funcABI, props.initializerOptions])

  const getContentOnCTC = (fields: HTMLInputElement[]) => {
    const multiString = getMultiValsString(fields)
    // copy-to-clipboard icon is only visible for method requiring input params
    if (!multiString) {
      return 'cannot encode empty arguments'
    }
    const multiJSON = JSON.parse('[' + multiString + ']')

    const encodeObj = txFormat.encodeData(
        props.funcABI,
        multiJSON,
        props.funcABI.type === 'constructor' ? props.evmBC : null)

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
    const multiValString = getMultiValsString(multiFields.current)

    if (multiValString) setBasicInput(multiValString)
  }

  const getMultiValsString = (fields: HTMLInputElement[]) => {
    const valArray = fields
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
      inputString = JSON.stringify([inputString])
      const inputJSON = JSON.parse(inputString)
      const multiInputs = multiFields.current

      for (let k = 0; k < multiInputs.length; k++) {
        if (inputJSON[k]) {
          multiInputs[k].value = JSON.stringify(inputJSON[k])
        }
      }
    }
  }

  const handleActionClick = () => {
    const deployMode = selectedDeployIndex !== null ? [props.deployOption[selectedDeployIndex].title] : []

    props.clickCallBack(props.funcABI.inputs, basicInput, deployMode)
  }

  const handleBasicInput = (e) => {
    const value = e.target.value

    setBasicInput(value)
  }

  const handleMultiValsSubmit = (fields: HTMLInputElement[]) => {
    const valsString = getMultiValsString(fields)
    const deployMode = selectedDeployIndex !== null ? [props.deployOption[selectedDeployIndex].title] : []

    if (valsString) {
      props.clickCallBack(props.funcABI.inputs, valsString, deployMode)
    } else {
      props.clickCallBack(props.funcABI.inputs, '', deployMode)
    }
  }

  const setSelectedDeploy = (index: number) => {
    setSelectedDeployIndex(index !== selectedDeployIndex ? index : null)
    if (basicInputRef.current) basicInputRef.current.value = ''
    setBasicInput('')
  }

  const toggleOptions = () => {
    setShowOptions(!showOptions)
  }

  return (
    <div className={`udapp_contractProperty ${hasArgs ? 'udapp_hasArgs' : ''}`}>
    {
      props.isDeploy ? !isMultiField ? 
      <DeployInput 
        buttonOptions={buttonOptions}
        funcABI={props.initializerOptions ? props.initializerOptions.inputs : props.funcABI}
        inputs={deployPlaceholder}
        handleBasicInput={handleBasicInput}
        basicInputRef={basicInputRef}
        selectedIndex={selectedDeployIndex}
        setSelectedIndex={setSelectedDeploy}
        handleActionClick={handleActionClick}
        deployOptions={props.deployOption}
      /> : <MultiDeployInput
        buttonOptions={buttonOptions}
        selectedIndex={selectedDeployIndex}
        setSelectedIndex={setSelectedDeploy}
        handleMultiValsSubmit={handleMultiValsSubmit}
        inputs={deployInputs}
        getMultiValsString={getMultiValsString}
        deployOptions={props.deployOption}
      /> :
      <>
        <div className="udapp_contractActionsContainerSingle pt-2" style={{ display: toggleContainer ? 'none' : 'flex' }}>
          <button onClick={handleActionClick} title={buttonOptions.title} className={`udapp_instanceButton ${props.widthClass} btn btn-sm ${buttonOptions.classList}`} data-id={buttonOptions.dataId}>{title}</button>
          <input
            className="form-control"
            data-id={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : 'multiParamManagerBasicInputField'}
            placeholder={props.inputs}
            title={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}
            onChange={handleBasicInput}
            ref={basicInputRef}
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
              <CopyToClipboard tip='Encode values of input fields & copy to clipboard' icon='fa-clipboard' direction={'bottom'} getContent={() => getContentOnCTC(multiFields.current)} />
              <button onClick={() => handleMultiValsSubmit(multiFields.current)} title={buttonOptions.title} data-id={buttonOptions.dataId} className={`udapp_instanceButton ${buttonOptions.classList}`}>{ buttonOptions.content }</button>
            </div>
          </div>
        </div>
      </>
    }
    </div>
  )
}
