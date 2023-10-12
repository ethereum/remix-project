import { CustomTooltip, RenderIf, RenderIfNot } from "@remix-ui/helper";
import { useContext } from "react";
import { CircuitAppContext } from "../contexts";
import { FormattedMessage } from "react-intl";
import { generateR1cs } from "../actions";

export function R1CSBtn () {
  const { plugin, appState } = useContext(CircuitAppContext)

  return (
    <button
      className="btn btn-secondary btn-block d-block w-100 text-break mb-1 mt-2"
      onClick={() => { generateR1cs(plugin, appState) }}
      disabled={(appState.filePath === "") || (appState.status === "compiling") || (appState.status === "generating") || (appState.status === "computing")}
    >
      <CustomTooltip
        placement="auto"
        tooltipId="overlay-tooltip-compile"
        tooltipText={
          <div className="text-left">
            <div>
              Outputs the constraints in r1cs format
            </div>
          </div>
        }
      >
        <div className="d-flex align-items-center justify-content-center">
          <RenderIf condition={appState.status === 'generating'}>
            <i className="fas fa-sync fa-spin mr-2" aria-hidden="true"></i>
          </RenderIf>
          <RenderIfNot condition={appState.status === 'generating'}>
            <i className="fas fa-sync mr-2" aria-hidden="true"></i>
          </RenderIfNot>
          <div className="text-truncate overflow-hidden text-nowrap">
            <span>
              <FormattedMessage id="circuit.generateR1cs" />
            </span>
          </div>
        </div>
      </CustomTooltip>
    </button>
  )
}