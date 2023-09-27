import { RenderIf } from "@remix-ui/helper";
import { useContext } from "react";
import { CircuitAppContext } from "../contexts";

export function VersionList () {
  const { appState, dispatch } = useContext(CircuitAppContext)

  const handleVersionSelect = (version: string) => {
    dispatch({ type: 'SET_COMPILER_VERSION', payload: version })
  }
  
  const versionList = Object.keys(appState.versionList)
  
  return (
    <select
      value={appState.version}
      onChange={(e) => handleVersionSelect(e.target.value)}
      className="custom-select"
    >
      <RenderIf condition={versionList.length > 0}>
        <>
          {
            versionList.map((version, index) => (
              <option value={version} key={index}>
                { appState.versionList[version].name }
              </option>
            ))
          }
        </>
      </RenderIf>
    </select>
  )
}
