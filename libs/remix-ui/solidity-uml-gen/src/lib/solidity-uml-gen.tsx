import React, { useState } from 'react'
import Viewer from 'react-viewer'
export interface RemixUiSolidityUmlGenProps {
  plugin: any
}

export function RemixUiSolidityUmlGen ({ plugin }: RemixUiSolidityUmlGenProps) {
  const [showViewer, setShowViewer] = useState(false)
  const [svgPayload, setSVGPayload] = useState('')
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