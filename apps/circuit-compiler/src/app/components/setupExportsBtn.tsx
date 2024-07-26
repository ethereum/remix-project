import { CustomTooltip } from "@remix-ui/helper"
import { FormattedMessage } from "react-intl"

export function SetupExportsBtn ({ handleRunSetup }: { handleRunSetup: () => void }) {
  return <button
    className="btn btn-secondary btn-block d-block w-100 text-break mt-2"
    onClick={handleRunSetup}
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
}