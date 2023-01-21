import React, { useEffect, useState } from 'react'
import Viewer from 'react-viewer'
import { ISolidityUmlGen } from '../types'
export interface RemixUiSolidityUmlGenProps {
  plugin: ISolidityUmlGen
}

export function RemixUiSolidityUmlGen ({ plugin }: RemixUiSolidityUmlGenProps) {
  const [showViewer, setShowViewer] = useState(false)
  const [svgPayload, setSVGPayload] = useState('')

  useEffect(() => {
    if (plugin.svgPayload.length > 1 
      && plugin.svgPayload.startsWith('<svg')) setSVGPayload(plugin.svgPayload)
  }, [plugin.svgPayload])

  return (
    <div>
      <h1>Solidity 2 UML Generator View!</h1>
      <Viewer
          visible={showViewer}
          rotatable={false}
          loop={false}
          noClose={false}
          onClose={() => setShowViewer(false)}
          noFooter={true}
          showTotal={false}
          changeable={false}
          zoomSpeed={0.2}
          minScale={1}
          images={[{src: `data:image/svg+xml;base64,${btoa(svgPayload)}`}]}
        />
    </div>
  )
}

export default RemixUiSolidityUmlGen