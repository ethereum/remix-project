import { ViewPlugin } from "@remixproject/engine-web";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

export interface flattenerUIProps {
  plugin: ViewPlugin
}

export const FlattenerUI = (props: flattenerUIProps) => {
  const { plugin } = props
  const [fileName, setFileName] = useState('')
  const [flatFileName, setFlatFileName] = useState('')
  const [log, setLog] = useState('')
  const [compilationResult, setCompilationResult] = useState<any>(null)


  useEffect(() => {
    plugin.onActivation = () => {
      setCallBacks()
      setLog('Flattener is activated')
    }
  }, [])

  const setCallBacks = () => {
    plugin.on(
      "solidity",
      "compilationFinished",
      async function (target, source, version, data) {
        plugin.emit('statusChanged', { key: 'none' })
        setFileName(target)
        //plugin.compilationResult = { data, source };
        //client.fileName.next(target)
      }
    )
  }
}


return (
  <div className="App p-3">
    <div>
      Select a contract, compile it, then get the flattened version by pressing the button.
      Flattened source code will be copied to the clipboard.
    </div>

    {fileName ?
      <div>
        <Button className='btn-sm w-100' onClick={async () => { }}>Flatten {fileName}</Button>
        <div>
          You can save the flattened version to the file inside Remix.
        </div>
        <Button className='btn-sm w-100' onClick={async () => { }}>Save {flatFileName}</Button>
      </div> : <div></div>}
    <div>{log}</div>
  </div>
)
}