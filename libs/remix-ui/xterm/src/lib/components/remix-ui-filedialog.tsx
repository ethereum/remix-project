import { Plugin } from "@remixproject/engine"
import React, { useEffect, useState } from "react"

interface RemixUIFileDialogInterface {
  plugin: Plugin
}

export const RemixUIFileDialog = (props: RemixUIFileDialogInterface) => {
  const { plugin } = props
  const [files, setFiles] = useState<string[]>([])
  const [workingDir, setWorkingDir] = useState<string>('')

  useEffect(() => {
    plugin.on('fs', 'workingDirChanged', async (path: string) => {
      console.log('workingDirChanged')
      setWorkingDir(path)
      await readdir()
    })
  }, [])

  const readdir = async () => {
    const files = await plugin.call('fs', 'readdir', '/')
    console.log('files', files)
    setFiles(files)
  }

  return (
    <>
      <h1>RemixUIFileDialog</h1>
      <button onClick={() => plugin.call('fs', 'setWorkingDir')}>open</button>
      <button onClick={async () => await readdir()}>read</button>
      <hr></hr>
      {workingDir}
      <hr></hr>

      {files.map(file => <div key={file}>{file}</div>)}
    </>
  )
}