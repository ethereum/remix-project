// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import * as remixLib from '@remix-project/remix-lib'
import { ContractGUIProps } from '../types'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { ButtonGroup, Dropdown } from 'react-bootstrap'

const txFormat = remixLib.execution.txFormat
export function ContractGUI (props: ContractGUIProps) {
  const [title, setTitle] = useState<string>('')
  const [basicInput, setBasicInput] = useState<string>('')
  // const [toggleContainer, setToggleContainer] = useState<boolean>(false)
  const [buttonOptions, setButtonOptions] = useState<{
    title: string,
    content: string,
    classList: string,
    dataId: string
  }>({ title: '', content: '', classList: '', dataId: '' })
  const [selectedDeployIndex, setSelectedDeployIndex] = useState<number[]>([])
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [hasArgs, setHasArgs] = useState<boolean>(false)
  const [isMultiField, setIsMultiField] = useState<boolean>(false)
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

    const hasArgs = (props.funcABI.inputs && props.funcABI.inputs.length > 0) ||
    (props.funcABI.type === 'fallback') ||
    (props.funcABI.type === 'receive') ||
    (props.isDeploy && props.initializerOptions && props.initializerOptions.inputs && (props.initializerOptions.inputs.inputs.length > 0))

    setHasArgs(hasArgs)
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

  useEffect(() => {
    if (props.initializerOptions) {
      if (props.initializerOptions.inputs.inputs.length > 1) setIsMultiField(true)
      else setIsMultiField(false)
    } else if (props.funcABI) {
      if (props.funcABI.inputs.length > 1) setIsMultiField(true)
      else setIsMultiField(false)
    } else setIsMultiField(false)
  }, [props.initializerOptions, props.funcABI])

  // const switchMethodViewOn = () => {
  //   setToggleContainer(true)
  //   makeMultiVal()
  // }

  const switchMethodViewOff = () => {
    // setToggleContainer(false)
    let multiValString = getMultiValsString()
  
    multiValString = multiValString.replace(/["]+/g, '')
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
    const deployMode = selectedDeployIndex.map(index => props.deployOption[index].title)

    props.clickCallBack(props.funcABI.inputs, basicInput, deployMode)
  }

  const handleBasicInput = (e) => {
    const value = e.target.value

    setBasicInput(value)
  }

  const handleMultiValsSubmit = () => {
    const valsString = getMultiValsString()
    const deployMode = selectedDeployIndex.map(index => props.deployOption[index].title)

    if (valsString) {
      props.clickCallBack(props.funcABI.inputs, valsString, deployMode)
    } else {
      props.clickCallBack(props.funcABI.inputs, '', deployMode)
    }
  }

  const setSelectedDeploy = (index: number) => {
    const indexes = selectedDeployIndex.slice()
    const existingIndex = indexes.findIndex(value => value === index)

    if (existingIndex > -1) indexes.splice(existingIndex, 1)
    else indexes.push(index)
    setSelectedDeployIndex(indexes)
  }

  const toggleOptions = () => {
    setShowOptions(!showOptions)
  }

  return (
    <div className={`udapp_contractProperty ${hasArgs ? 'udapp_hasArgs' : ''}`}>
      <div className="udapp_contractActionsContainerSingle pt-2" style={{ display: 'flex' }}>
        {
          props.isDeploy && !isMultiField && (props.deployOption || []).length > 0 &&
          <Dropdown as={ButtonGroup} show={showOptions}>
            <button onClick={handleActionClick} title={buttonOptions.title} className={`udapp_instanceButton ${props.widthClass} btn btn-sm ${buttonOptions.classList}`} data-id={buttonOptions.dataId}>Deploy</button>
            <Dropdown.Toggle split id="dropdown-split-basic" className={`btn btn-sm dropdown-toggle dropdown-toggle-split ${buttonOptions.classList}`} style={{ maxWidth: 25, minWidth: 0, height: 32 }} onClick={toggleOptions} />
            <Dropdown.Menu className="deploy-items border-0">
              {
                (props.deployOption).map(({ title, active }, index) => <Dropdown.Item onClick={() => setSelectedDeploy(index)} key={index}> { selectedDeployIndex.includes(index) ? <span>&#10003; {title} </span> : <span className="pl-3">{title}</span> }</Dropdown.Item>)
              }
            </Dropdown.Menu>
          </Dropdown>
        }
        {
          props.isDeploy && !isMultiField && !props.deployOption &&
          <button onClick={handleActionClick} title={buttonOptions.title} className={`udapp_instanceButton ${props.widthClass} btn btn-sm ${buttonOptions.classList}`} data-id={buttonOptions.dataId}>{title}</button>
        }
        {
          props.isDeploy && !isMultiField && props.initializerOptions &&
            <>
              <input
                className="form-control"
                data-id={props.initializerOptions.inputs.type === 'fallback' || props.initializerOptions.inputs.type === 'receive' ? `'(${props.initializerOptions.inputs.type}')` : 'multiParamManagerBasicInputField'}
                placeholder={props.initializerOptions.initializeInputs}
                title={props.initializerOptions.inputs.type === 'fallback' || props.initializerOptions.inputs.type === 'receive' ? `'(${props.initializerOptions.inputs.type}')` : props.initializerOptions.initializeInputs}
                onChange={handleBasicInput}
                ref={basicInputRef}
                style={{ visibility: !((props.initializerOptions.inputs.inputs && props.initializerOptions.inputs.inputs.length > 0) || (props.initializerOptions.inputs.type === 'fallback') || (props.initializerOptions.inputs.type === 'receive')) ? 'hidden' : 'visible' }} />
              {/* <i
                className="fas fa-angle-down udapp_methCaret"
                onClick={switchMethodViewOn}
                title={title}
                style={{ visibility: !(props.initializerOptions.inputs.inputs && props.initializerOptions.inputs.inputs.length > 0) ? 'hidden' : 'visible' }}>
              </i> */}
            </>
        }
        {
          props.isDeploy && !isMultiField && props.funcABI &&
          <>
            <input
              className="form-control"
              data-id={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : 'multiParamManagerBasicInputField'}
              placeholder={props.inputs}
              title={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}
              onChange={handleBasicInput}
              ref={basicInputRef}
              style={{ visibility: !((props.funcABI.inputs && props.funcABI.inputs.length > 0) || (props.funcABI.type === 'fallback') || (props.funcABI.type === 'receive')) ? 'hidden' : 'visible' }} />
            {/* <i
              className="fas fa-angle-down udapp_methCaret"
              onClick={switchMethodViewOn}
              title={title}
              style={{ visibility: !(props.funcABI.inputs && props.funcABI.inputs.length > 0) ? 'hidden' : 'visible' }}>
            </i> */}
          </>
        }
      </div>
      { isMultiField && props.isDeploy && props.initializerOptions &&
            <div className="udapp_contractActionsContainerMulti" style={{ display: 'flex' }}>
              <div className="udapp_contractActionsContainerMultiInner text-dark">
                <div className="udapp_multiHeader">
                  <div className="udapp_multiTitle run-instance-multi-title">{title}</div>
                </div>
                <div>
                  {props.initializerOptions.inputs.inputs.map((inp, index) => {
                    return (
                      <div className="udapp_multiArg" key={index}>
                        <label htmlFor={inp.name}> {inp.name}: </label>
                        <input ref={el => { multiFields.current[index] = el }} className="form-control" placeholder={inp.type} title={inp.name} data-id={`multiParamManagerInput${inp.name}`} />
                      </div>)
                  })}
                </div>
              <div className="udapp_group udapp_multiArg">
                {/* <CopyToClipboard tip='Encode values of input fields & copy to clipboard' icon='fa-clipboard' direction={'left'} getContent={getContentOnCTC} /> */}
                {
                  (props.deployOption || []).length > 0 ?
                  <Dropdown as={ButtonGroup} show={showOptions}>
                    <button onClick={handleMultiValsSubmit} title={buttonOptions.title} className={`udapp_instanceButton ${props.widthClass} btn btn-sm ${buttonOptions.classList}`} data-id={buttonOptions.dataId}>Deploy</button>
                    <Dropdown.Toggle split id="dropdown-split-basic" className={`btn btn-sm dropdown-toggle dropdown-toggle-split ${buttonOptions.classList}`} style={{ maxWidth: 25, minWidth: 0, height: 32 }} onClick={toggleOptions} />
                    <Dropdown.Menu className="deploy-items border-0">
                      {
                        (props.deployOption).map(({ title, active }, index) => <Dropdown.Item onClick={() => setSelectedDeploy(index)} key={index}> { selectedDeployIndex.includes(index) ? <span>&#10003; {title} </span> : <span className="pl-3">{title}</span> }</Dropdown.Item>)
                      }
                    </Dropdown.Menu>
                  </Dropdown> :
                  <button onClick={handleMultiValsSubmit} title={buttonOptions.title} data-id={buttonOptions.dataId} className={`udapp_instanceButton ${buttonOptions.classList}`}>{ title }</button>
                }
              </div>
            </div>
          </div>
      }
        <div className="udapp_contractActionsContainerMulti" style={{ display: 'flex' }}>
            <div className="udapp_contractActionsContainerMultiInner text-dark">
              <div className="udapp_multiHeader">
                <div className="udapp_multiTitle run-instance-multi-title">{title}</div>
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
              <button onClick={handleMultiValsSubmit} title={buttonOptions.title} data-id={buttonOptions.dataId} className={`udapp_instanceButton ${buttonOptions.classList}`}>{ buttonOptions.content }</button>
            </div>
          </div>
        </div>
    </div>
  )
}
