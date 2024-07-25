import { CustomTooltip, RenderIf, RenderIfNot } from "@remix-ui/helper"
import { useContext } from "react"
import { CircuitAppContext } from "../contexts"
import { FormattedMessage } from "react-intl"

export function SetupExportsBtn () {
  const { plugin, appState } = useContext(CircuitAppContext)

  return (
    <button
      className="btn btn-secondary btn-block d-block w-100 text-break mt-2"
    >
      <CustomTooltip
        placement="auto"
        tooltipId="overlay-tooltip-compile"
        tooltipText={
          <div className="text-left">
            <div>
              Click to setup and export verification keys
            </div>
          </div>
        }
      >
        <div className="d-flex align-items-center justify-content-center">
          <div className="text-truncate overflow-hidden text-nowrap">
            <span>
              <FormattedMessage id="circuit.runSetup" />
            </span>
          </div>
        </div>
      </CustomTooltip>
    </button>
  )
}