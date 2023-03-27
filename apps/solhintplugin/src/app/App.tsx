import React, { useEffect, useState } from "react"
import { SolhintPlugin } from "./SolhintPlugin"


const client = new SolhintPlugin()

export default function App() {
  const [contents, setContents] = useState('')
  useEffect(() => {
    client.eventEmitter.on('contentsReady', (fileContents: string) => {
      setContents(fileContents)
    })

  }, [])
  return (
    <>
      <div className="m-5 p-2">
      </div>
    </>
  )
}