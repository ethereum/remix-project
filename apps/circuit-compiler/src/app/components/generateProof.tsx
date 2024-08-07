import { RenderIf } from "@remix-ui/helper"
import { FormattedMessage } from "react-intl"
import { generateProof } from "../actions"
import { CircuitAppContext } from "../contexts"
import { useContext } from "react"

export function GenerateProof () {
  const circuitApp = useContext(CircuitAppContext)
  const status = circuitApp.appState.status

  return (
    <div className="flex-column d-flex">
      <button
        className="btn btn-secondary btn-block d-block w-100 text-break mb-1 mt-1"
        onClick={() => generateProof(circuitApp.plugin, circuitApp.appState, circuitApp.dispatch)}
        disabled={(status === "compiling") || (status === "computing") || (status === "proving") || (status === "exporting")}
        data-id="compute_witness_btn"
      >
        <RenderIf condition={status === 'proving'}>
          <i className="fas fa-sync fa-spin mr-2" aria-hidden="true"></i>
        </RenderIf>
        <FormattedMessage id="circuit.generateProof" />
      </button>
    </div>
  )
}
