import { useState } from "react"
import { FormattedMessage } from "react-intl"
import { RenderIf, RenderIfNot } from "@remix-ui/helper"

export function Toggler ({ children, title, dataId }: { children: JSX.Element, title: string, dataId: string }) {
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)

  const toggleConfigurations = () => {
    setToggleExpander(!toggleExpander)
  }

  return (
    <div>
      <div className="d-flex circuit_config_section justify-content-between" onClick={toggleConfigurations} data-id={dataId}>
        <div className="d-flex">
          <label className="mt-1 circuit_config_section">
            <FormattedMessage id={title} />
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