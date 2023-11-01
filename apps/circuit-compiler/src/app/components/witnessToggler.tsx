import { useState } from "react"
import { FormattedMessage } from "react-intl"
import { RenderIf, RenderIfNot } from "@remix-ui/helper"

export function WitnessToggler ({ children }: { children: JSX.Element }) {
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)

  const toggleConfigurations = () => {
    setToggleExpander(!toggleExpander)
  }

  return (
    <div>
      <div className="d-flex circuit_config_section justify-content-between" onClick={toggleConfigurations}>
        <div className="d-flex">
          <label className="mt-1 circuit_config_section">
            <FormattedMessage id="circuit.computeWitness" />
          </label>
        </div>
        <div>
          <span data-id="scConfigExpander" onClick={toggleConfigurations}>
            <RenderIf condition={toggleExpander}>
              <i className="fas fa-angle-down" aria-hidden="true"></i>
            </RenderIf>
            <RenderIfNot condition={toggleExpander}>
              <i className="fas fa-angle-right" aria-hidden="true"></i>
            </RenderIfNot>
          </span>
        </div>
      </div>
      <RenderIf condition={toggleExpander}>
        { children }
      </RenderIf>
    </div>
  )
}