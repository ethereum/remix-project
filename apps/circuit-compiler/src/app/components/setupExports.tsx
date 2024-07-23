import { CustomTooltip } from "@remix-ui/helper"
import { FormattedMessage } from "react-intl"

export function SetupExports () {
  return (
    <div className="pb-2 border-bottom flex-column">
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
                value={'final_08.ptau'}
                className="custom-select"
                style={{
                  pointerEvents: 'auto'
                }}
              >
              </select>
            </div>
          </CustomTooltip>
          <label className="circuit_inner_label form-check-label" htmlFor="circuitRandomText">
            <FormattedMessage id="circuit.randomText" />
          </label>
          <input className="form-control m-0 txinput mb-1" placeholder="My First Contribution" />
          <label className="circuit_inner_label form-check-label" htmlFor="circuitRandomBeacon">
            <FormattedMessage id="circuit.randomBeacon" />
          </label>
          <input className="form-control m-0 txinput" placeholder="0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f" />
        </div>
      </div>
    </div>
  )
}