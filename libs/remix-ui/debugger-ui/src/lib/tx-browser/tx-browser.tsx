import React, { useState, useEffect, useRef } from 'react'  //eslint-disable-line
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import './tx-browser.css'

export const TxBrowser = ({ requestDebug, updateTxNumberFlag, unloadRequested, transactionNumber, debugging }) => {
  const [state, setState] = useState({
    txNumber: ''
  })

  const inputValue = useRef(null)
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
            placeholder={'Transaction hash, should start with 0x'}
            data-id='debuggerTransactionInput'
            disabled={debugging}
          />
        </div>
        <div className='d-flex justify-content-center w-100 btn-group py-1'>
          <OverlayTrigger
            placement={'bottom'}
            overlay={
              <Tooltip className={'text-nowrap'} id={'debuggingButtontooltip'}>
                <span>
                  {debugging ? 'Stop debugging' : 'Start debugging'}
                </span>
              </Tooltip>
            }
          >
            <div id="debuggerTransactionStartButtonContainer" data-id="debuggerTransactionStartButton" onClick={handleSubmit} className="btn btn-primary btn-sm btn-block text-decoration-none">
              <button
                className='btn btn-link btn-sm btn-block h-75 p-0 m-0 text-decoration-none'
                id='load'
                onClick={handleSubmit}
                data-id='debuggerTransactionStartButton'
                disabled={!state.txNumber }
                style={{ pointerEvents: 'none', color: 'white' }}
              >
                  <span>{ debugging ? 'Stop' : 'Start' } debugging</span>
              </button>
            </div>
          </OverlayTrigger>
        </div>
      </div>
      <span id='error' />
    </div>
  )
}

export default TxBrowser
