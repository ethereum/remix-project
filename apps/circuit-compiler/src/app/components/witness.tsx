import { CustomTooltip } from "@remix-ui/helper";
import { FormattedMessage } from "react-intl";

export function WitnessSection () {
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
              <input className="form-control m-0 txinput" placeholder="Signal A" />
            </div>
          </CustomTooltip>
        </div>
      </div>
    </div>
  )
}