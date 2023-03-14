import React, { useEffect, useState } from "react"
import { DocViewer } from "./docviewer"

const client = new DocViewer()

export default function App() {
  const [contents, setContents] = useState('')
  useEffect(() => {
    client.eventEmitter.on('contentsReady', (fileContents: string) => {
      console.log('contentsReady', fileContents)
      setContents(fileContents)
    })

  }, [])
  return (
    <>
      <h1>Documentation Viewer</h1>
      <p>
        Show documentation of compiled contracts.
      </p>
      <p>
        {contents && contents.length}
      </p>
    </>
  )
}