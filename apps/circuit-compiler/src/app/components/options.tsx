import { useContext } from 'react'
import {FormattedMessage} from 'react-intl'
import { CircuitAppContext } from '../contexts'

export function CompileOptions () {
  const { appState, dispatch } = useContext(CircuitAppContext)
  const handleCircuitAutoCompile = (value: boolean) => {
    dispatch({ type: 'SET_AUTO_COMPILE', payload: value })
  }

  return (
    <div className='pb-2'>
      <div className="mt-2 custom-control custom-checkbox">
        <input
          className="custom-control-input"
          type="checkbox"
          onChange={(e) => handleCircuitAutoCompile(e.target.checked)}
          title="Auto compile"
          checked={appState.autoCompile}
          id="autoCompileCircuit"
        />
        <label className="form-check-label custom-control-label" htmlFor="autoCompileCircuit">
          <FormattedMessage id="circuit.autoCompile" />
        </label>
      </div>
      <div className="mt-1 mb-2 circuit_warnings_box custom-control custom-checkbox">
        <input
          className="custom-control-input"
          // onChange={handleHideWarningsChange}
          id="hideCircuitWarnings"
          type="checkbox"
          title="Hide warnings"
          // checked={state.hideWarnings}
        />
        <label className="form-check-label custom-control-label" htmlFor="hideCircuitWarnings">
          <FormattedMessage id="solidity.hideWarnings" />
        </label>
      </div>
    </div>
  )
}