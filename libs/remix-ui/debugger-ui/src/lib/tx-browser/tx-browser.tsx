import { CustomTooltip } from '@remix-ui/helper'
import React, { useState, useEffect, useRef } from 'react'  //eslint-disable-line
import { useIntl, FormattedMessage } from 'react-intl'
import './tx-browser.css'

export const TxBrowser = ({ requestDebug, updateTxNumberFlag, unloadRequested, transactionNumber, debugging }) => {
  const [state, setState] = useState({
    txNumber: ''
  })

  const inputValue = useRef(null)

  const intl = useIntl()

  useEffect(() => {
    setState(prevState => {
      return {
        ...prevState,
        txNumber: transactionNumber
      }
    })
  }, [transactionNumber])

  const handleSubmit = () => {
    if (debugging) {
      unload()
    } else {
      requestDebug(undefined, state.txNumber)
    }
  }

  const unload = () => {
    unloadRequested()
  }

  const txInputChanged = (value) => {
    // todo check validation of txnumber in the input element, use
    // required
    // oninvalid="setCustomValidity('Please provide a valid transaction number, must start with 0x and have length of 22')"
    // pattern="^0[x,X]+[0-9a-fA-F]{22}"
    // this.state.txNumberInput.setCustomValidity('')
    setState(prevState => {
      return {
        ...prevState,
        txNumber: value
      }
    })
  }

  const txInputOnInput = () => {
    updateTxNumberFlag(!inputValue.current.value)
  }
  const customJSX = (
    <div id="debuggerTransactionStartButtonContainer" data-id="debuggerTransactionStartButton" onClick={handleSubmit} className="btn btn-primary btn-sm btn-block text-decoration-none">
              <button
                className='btn btn-link btn-sm btn-block h-75 p-0 m-0 text-decoration-none'
                id='load'
                onClick={handleSubmit}
                data-id='debuggerTransactionStartButton'
                disabled={!state.txNumber }
                style={{ pointerEvents: 'none', color: 'white' }}
              >
                  <span><FormattedMessage id={`debugger.${debugging ? 'stopDebugging' : 'startDebugging'}`} /></span>
              </button>
            </div>
  )
  return (
    <div className='pb-2 container px-0'>
      <div className='txContainer'>
        <div className='py-1 d-flex justify-content-center w-100 input-group'>
          <input
            ref={inputValue}
            value={state.txNumber}
            className='form-control m-0 txinput'
            id='txinput'
            type='text'
            onChange={({ target: { value } }) => txInputChanged(value)}
            onInput={txInputOnInput}
            placeholder={intl.formatMessage({id: 'debugger.placeholder'})}
            data-id='debuggerTransactionInput'
            disabled={debugging}
          />
        </div>
        <div className='d-flex justify-content-center w-100 btn-group py-1'>
          <CustomTooltip
            placement="bottom"
            tooltipText={<FormattedMessage id={`debugger.${debugging ? 'stopDebugging' : 'startDebugging'}`} />}
            tooltipId={'debuggingButtontooltip'}
            tooltipClasses="text-nowrap"
          >
            {customJSX}
          </CustomTooltip>
        </div>
      </div>
      <span id='error' />
    </div>
  )
}

export default TxBrowser
