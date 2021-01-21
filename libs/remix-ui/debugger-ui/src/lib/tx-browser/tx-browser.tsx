import React, { useState, useEffect, useRef } from 'react'  //eslint-disable-line
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
    <div className='container px-0'>
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
          <button
            className='btn btn-primary btn-sm txbutton'
            id='load'
            title={debugging ? 'Stop debugging' : 'Start debugging'}
            onClick={handleSubmit}
            data-id='debuggerTransactionStartButton'
            disabled={!state.txNumber }
          >
            { debugging ? 'Stop' : 'Start' } debugging
          </button>
        </div>
      </div>
      <span id='error' />
    </div>
  )
}

export default TxBrowser
