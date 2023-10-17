import { RenderIf } from "@remix-ui/helper";
import { AppState } from "../types";

export function VersionList ({ currentVersion, versionList, setVersion }: { versionList: AppState['versionList'], currentVersion: string, setVersion: (version: string) => void }) {
  const versionListKeys = Object.keys(versionList)
  
  return (
    <select
      value={currentVersion}
      onChange={(e) => setVersion(e.target.value)}
      className="custom-select"
    >
      <RenderIf condition={versionListKeys.length > 0}>
        <>
          {
            versionListKeys.map((version, index) => (
              <option value={version} key={index}>
                { versionList[version].name }
              </option>
            ))
          }
        </>
      </RenderIf>
    </select>
  )
}
