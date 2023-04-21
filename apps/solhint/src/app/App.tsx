import React, { useEffect, useState } from "react"
import { SolHint } from "./SolhintPluginClient"


const client = new SolHint()

export default function App() {
  const [contents, setContents] = useState([])
  useEffect(() => {
    client.eventEmitter.on('report', (report: any) => {
      setContents(fileContents => [...fileContents, report])
    })

  }, [])
  return (
    <>
      <div className="">
        <h1 className="text-2xl font-bold">Solhint Plugin</h1>
        {contents.map((content, index) => {
          return (
            <div key={index} className="">
              <div className="text-sm">{content.message}</div>
              <div className="text-sm">{content.line}</div>
              <div className="text-sm">{content.column}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}