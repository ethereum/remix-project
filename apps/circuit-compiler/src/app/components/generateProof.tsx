import { RenderIf } from "@remix-ui/helper"
import { FormattedMessage } from "react-intl"
import { generateProof } from "../actions"
import { CircuitAppContext } from "../contexts"
import { useContext } from "react"

export function GenerateProof () {
  const circuitApp = useContext(CircuitAppContext)
  const status = circuitApp.appState.status

  const handleGenerateProof = async () => {
    try {
      circuitApp.dispatch({ type: 'SET_COMPILER_STATUS', payload: 'proving' })
      await generateProof(circuitApp.plugin, circuitApp.appState)
      circuitApp.dispatch({ type: 'SET_COMPILER_STATUS', payload: 'idle' })
    } catch (e) {
      circuitApp.dispatch({ type: 'SET_COMPILER_STATUS', payload: 'errored' })
      console.error(e)
    }
  }

  return (
    <div className="flex-column d-flex">
      <button
        className="btn btn-secondary btn-block d-block w-100 text-break mb-1 mt-1"
        onClick={handleGenerateProof}
        disabled={(status === "compiling") || (status === "computing") || (status === "proving") || (status === "exporting")}
        data-id="compute_witness_btn"
      >
        <RenderIf condition={status === 'computing'}>
          <i className="fas fa-sync fa-spin mr-2" aria-hidden="true"></i>
        </RenderIf>
        <FormattedMessage id="circuit.generateProof" />
      </button>
    </div>
  )
}
