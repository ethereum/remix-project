import { RenderIf, RenderIfNot } from "@remix-ui/helper";
import { FormattedMessage } from "react-intl";
import { CompilerStatus } from "../types";

export function WitnessSection ({ signalInputs, status }: {signalInputs: string[], status: CompilerStatus}) {
  return (
    <div className="pb-2 border-bottom flex-column">
      <div className="flex-column d-flex">
        <RenderIf condition={signalInputs.length > 0}>
          <>
            {
              signalInputs.map((input, index) => (
                <div className="mb-2 ml-0" key={index}>
                  <label className="circuit_inner_label form-check-label" htmlFor="circuitPrimeSelector">
                    <FormattedMessage id="circuit.signalInput" /> { input }
                  </label>
                  <input className="form-control m-0 txinput" placeholder={input} />
                </div>
              ))
            }
            <button className="btn btn-sm btn-secondary" >
              <RenderIf condition={status === 'computing'}>
                <i className="fas fa-sync fa-spin mr-2" aria-hidden="true"></i>
              </RenderIf>
              <RenderIfNot condition={status === 'computing'}>
                <i className="fas fa-sync mr-2" aria-hidden="true"></i>
              </RenderIfNot>
              <FormattedMessage id="circuit.compute" />
            </button>
          </>
        </RenderIf>
      </div>
    </div>
  )
}