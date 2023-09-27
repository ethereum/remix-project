import { CustomTooltip } from "@remix-ui/helper"
import { useContext } from "react"
import { FormattedMessage } from "react-intl"
import { CircuitAppContext } from "../contexts"
import { PrimeValue } from "../types"

export function Configurations () {
  const { appState, dispatch } = useContext(CircuitAppContext)

  const handlePrimeChange = (value: string) => {
    dispatch({ type: 'SET_PRIME_VALUE', payload: value as PrimeValue })
  }

  return (
    <div className="pb-2 border-bottom flex-column">
      <div className="flex-column d-flex">
        <div className="mb-2 ml-0">
          <label className="circuit_inner_label form-check-label" htmlFor="circuitPrimeSelector">
            <FormattedMessage id="circuit.prime" />
          </label>
          <CustomTooltip
            placement={"auto"}
            tooltipId="circuitPrimeLabelTooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<span>{'To choose the prime number to use to generate the circuit. Receives the name of the curve (bn128, bls12381, goldilocks) [default: bn128]'}</span>}
          >
            <div>
              <select
                onChange={(e) => handlePrimeChange(e.target.value)}
                value={appState.primeValue}
                className="custom-select"
                style={{
                  pointerEvents: 'auto'
                }}
              >
                <option value="bn128">bn128</option>
                <option value="bls12381">bls12381</option>
                <option value="goldilocks">goldilocks</option>
              </select>
            </div>
          </CustomTooltip>
        </div>
      </div>
    </div>
  )
}