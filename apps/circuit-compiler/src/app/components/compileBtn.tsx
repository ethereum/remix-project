import { CustomTooltip, RenderIf, RenderIfNot, extractNameFromKey } from "@remix-ui/helper";
import { useContext } from "react";
import { CircuitAppContext } from "../contexts";
import { FormattedMessage } from "react-intl";
import { compileCircuit } from "../actions";

export function CompileBtn () {
  const { plugin, appState } = useContext(CircuitAppContext)

  return (
    <button
      className="btn btn-primary btn-block d-block w-100 text-break mb-1 mt-3"
      onClick={() => { compileCircuit(plugin, appState) }}
      disabled={(appState.filePath === "") || (appState.status === "compiling") || (appState.status === "generating")}
    >
      <CustomTooltip
        placement="auto"
        tooltipId="overlay-tooltip-compile"
        tooltipText={
          <div className="text-left">
            <div>
              <b>Ctrl+S</b> to compile {appState.filePath}
            </div>
          </div>
        }
      >
        <div className="d-flex align-items-center justify-content-center">
          <RenderIf condition={appState.status === 'compiling'}>
            <i className="fas fa-sync fa-spin mr-2" aria-hidden="true"></i>
          </RenderIf>
          <RenderIfNot condition={appState.status === 'compiling'}>
            <i className="fas fa-sync mr-2" aria-hidden="true"></i>
          </RenderIfNot>
          <div className="text-truncate overflow-hidden text-nowrap">
            <span>
              <FormattedMessage id="circuit.compile" />
            </span>
            <span className="ml-1 text-nowrap">
              <RenderIf condition={appState.filePath === ""}>
                <FormattedMessage id="circuit.noFileSelected" />
              </RenderIf>
              <RenderIfNot condition={appState.filePath === ""}>
                <>{extractNameFromKey(appState.filePath)}</>
              </RenderIfNot>
            </span>
          </div>
        </div>
      </CustomTooltip>
    </button>
  )
}