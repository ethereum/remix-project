import React, { useState } from 'react'
import './tx-browser.css'
import EventManager from '../../../../../../apps/remix-ide/src/lib/events'

export const TxBrowser = ({ requestDebug, unloadRequested }) => {
  const event = new EventManager()
  const [state, setState] = useState({
    txNumber: undefined,
    debugging: false
  })

  const handleSubmit = () => {
    if (state.debugging) {
      unload()
    } else {
      requestDebug(undefined, state.txNumber)
    }
  }
  
  const unload = () => {
    unloadRequested()
  }

  const txInputChanged = (e) => {
    // todo check validation of txnumber in the input element, use
    // required
    // oninvalid="setCustomValidity('Please provide a valid transaction number, must start with 0x and have length of 22')"
    // pattern="^0[x,X]+[0-9a-fA-F]{22}"
    // this.state.txNumberInput.setCustomValidity('')
  
    setState(prevState => {
      return {
        ...prevState,
        txNumber: e.target.value
      }
    })
  }

  return (
    <div className="container">
      <div className="txContainer">
        <div className="py-1 d-flex justify-content-center w-100 input-group">
          <input
            defaultValue={state.txNumber || ''}
            className="form-control m-0 css.txinput"
            id='txinput'
            type='text'
            onChange={txInputChanged}
            placeholder={'Transaction hash, should start with 0x'}
            data-id="debuggerTransactionInput"
            disabled={state.debugging}
          />
        </div>
        <div className="d-flex justify-content-center w-100 btn-group py-1">
        <button
          className="btn btn-primary btn-sm txbutton"
          id="load"
          title={state.debugging ? 'Stop debugging' : 'Start debugging'}
          onClick={handleSubmit}
          data-id="debuggerTransactionStartButton"
          disabled={!state.txNumber ? true : !state.debugging ? false : true }
        >
          { state.debugging ? 'Stop' : 'Start' } debugging
        </button>
        </div>
      </div>
      <span id='error'></span>
    </div>
  )
}

export default TxBrowser
