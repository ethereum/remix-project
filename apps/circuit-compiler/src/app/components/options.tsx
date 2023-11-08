import {FormattedMessage} from 'react-intl'
import { CompileOptionsProps } from '../types'

export function CompileOptions ({autoCompile, hideWarnings, setCircuitAutoCompile, setCircuitHideWarnings}: CompileOptionsProps) {

  return (
    <div className='pb-2'>
      <div className="mt-2 custom-control custom-checkbox">
        <input
          className="custom-control-input"
          type="checkbox"
          onChange={(e) => setCircuitAutoCompile(e.target.checked)}
          title="Auto compile"
          checked={autoCompile}
          id="autoCompileCircuit"
        />
        <label className="form-check-label custom-control-label" htmlFor="autoCompileCircuit" data-id="auto_compile_circuit_checkbox_input">
          <FormattedMessage id="circuit.autoCompile" />
        </label>
      </div>
      <div className="mt-1 mb-2 circuit_warnings_box custom-control custom-checkbox">
        <input
          className="custom-control-input"
          onChange={(e) => setCircuitHideWarnings(e.target.checked)}
          id="hideCircuitWarnings"
          type="checkbox"
          title="Hide warnings"
          checked={hideWarnings}
        />
        <label className="form-check-label custom-control-label" htmlFor="hideCircuitWarnings" data-id="hide_circuit_warnings_checkbox_input">
          <FormattedMessage id="solidity.hideWarnings" />
        </label>
      </div>
    </div>
  )
}