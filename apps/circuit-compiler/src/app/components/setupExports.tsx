import { CustomTooltip } from "@remix-ui/helper"
import { FormattedMessage } from "react-intl"
import { SetupExportsBtn } from "./setupExportsBtn"
import { useContext } from "react"
import { CircuitAppContext } from "../contexts"
import { runSetupAndExport } from "../actions"

export function SetupExports () {
  const circuitApp = useContext(CircuitAppContext)

  // const handleRandomTextChange = (value: string) => {
  //   circuitApp.dispatch({ type: 'SET_RANDOM_TEXT', payload: value })
  // }

  // const handleRandomBeaconChange = (value: string) => {
  //   circuitApp.dispatch({ type: 'SET_RANDOM_BEACON', payload: value })
  // }

  return (
    <div className="flex-column">
      <div className="flex-column d-flex">
        <div className="mb-1 ml-0">
          <label className="circuit_inner_label form-check-label">
            <FormattedMessage id="circuit.provingScheme" />
          </label>
          <div className="radio custom-control custom-radio mb-1 form-check">
            <input
              type="radio"
              className="align-middle custom-control-input"
              name="circuitProvingScheme"
              id="groth16ProvingScheme"
              onClick={() => circuitApp.dispatch({ type: 'SET_PROVING_SCHEME', payload: 'groth16' })}
              value='groth16'
              checked={circuitApp.appState.provingScheme === 'groth16'}
            />
            <label className="form-check-label custom-control-label" htmlFor="groth16ProvingScheme" style={{ paddingTop: '0.125rem' }}>
              Groth16
            </label>
          </div>
          <div className="radio custom-control custom-radio form-check">
            <input
              type="radio"
              className="align-middle custom-control-input"
              name="circuitProvingScheme"
              id="plonkProvingScheme"
              onClick={() => circuitApp.dispatch({ type: 'SET_PROVING_SCHEME', payload: 'plonk' })}
              value='plonk'
              checked={circuitApp.appState.provingScheme === 'plonk'}
            />
            <label className="form-check-label custom-control-label" htmlFor="plonkProvingScheme" style={{ paddingTop: '0.125rem' }}>
              Plonk
            </label>
          </div>
        </div>
        <div className="mb-1 ml-0">
          <label className="circuit_inner_label form-check-label">
            <FormattedMessage id="circuit.ptau" />
          </label>
          <CustomTooltip
            placement={"auto"}
            tooltipId="circuitPtauTooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<span>{'To choose the from the list of ptau files'}</span>}
          >
            <div className="mb-1">
              <select
                value={circuitApp.appState.ptauValue}
                className="custom-select"
                style={{
                  pointerEvents: 'auto'
                }}
                onChange={(e) => circuitApp.dispatch({ type: 'SET_PTAU_VALUE', payload: e.target.value })}
              >
                {
                  circuitApp.appState.ptauList.map((ptau, index) => {
                    return (
                      <option key={index} value={ptau.name}>{`${ptau.name} (${ptau.maxConstraint} max constr.)`}</option>
                    )
                  })
                }
              </select>
            </div>
          </CustomTooltip>
          {/* <label className="circuit_inner_label form-check-label" htmlFor="circuitRandomText">
            <FormattedMessage id="circuit.randomText" />
          </label>
          <input className="form-control m-0 txinput mb-1" placeholder="My First Contribution" />
          <label className="circuit_inner_label form-check-label" htmlFor="circuitRandomBeacon">
            <FormattedMessage id="circuit.randomBeacon" />
          </label>
          <input className="form-control m-0 txinput mb-1" placeholder="0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f" /> */}
          <div className="mt-2 custom-control custom-checkbox">
            <input
              className="custom-control-input"
              type="checkbox"
              title="Export Verifier Contract"
              id="circuitExportVerifierContract"
              onChange={() => circuitApp.dispatch({ type: 'SET_EXPORT_VERIFICATION_CONTRACT', payload: !circuitApp.appState.exportVerificationContract })}
              checked={circuitApp.appState.exportVerificationContract}
            />
            <label className="form-check-label custom-control-label pt-1" htmlFor="circuitExportVerifierContract">
              <FormattedMessage id="circuit.exportVerifierContract" />
            </label>
          </div>
          <div className="mt-2 custom-control custom-checkbox">
            <input
              className="custom-control-input"
              type="checkbox"
              title="Export Verification Key"
              id="circuitExportVerificationKey"
              onChange={() => circuitApp.dispatch({ type: 'SET_EXPORT_VERIFICATION_KEY', payload: !circuitApp.appState.exportVerificationKey })}
              checked={circuitApp.appState.exportVerificationKey}
            />
            <label className="form-check-label custom-control-label pt-1" htmlFor="circuitExportVerificationKey">
              <FormattedMessage id="circuit.exportVerificationKey" />
            </label>
          </div>
          <SetupExportsBtn handleRunSetup={() => runSetupAndExport(circuitApp.plugin, circuitApp.appState)} />
        </div>
      </div>
    </div>
  )
}