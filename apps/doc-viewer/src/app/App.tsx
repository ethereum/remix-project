import React, { useEffect, useState } from "react"
import { DocViewer } from "./docviewer"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const client = new DocViewer()

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
        <ReactMarkdown children={contents} remarkPlugins={[remarkGfm]}/>
      </div>
    </>
  )
}