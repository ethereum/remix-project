import React, { useEffect, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { ISolidityUmlGen } from '../types'
import './css/solidity-uml-gen.css'
export interface RemixUiSolidityUmlGenProps {
  plugin?: ISolidityUmlGen
  updatedSvg?: string
  loading?: boolean
}

type ButtonAction = {
  svgValid: () => boolean
  action: () => void
  buttonText: string
}

interface ActionButtonsProps {
  buttons: ButtonAction[]
}

const ActionButtons = ({ buttons }: ActionButtonsProps) => (
  <>
    {buttons.map(btn => (
      <button
        key={btn.buttonText}
        className="btn btn-primary btn-md ml-4 mt-4"
        disabled={!btn.svgValid}
        onClick={btn.action}
      >
        {btn.buttonText}
      </button>
    ))}
  </>
)

export function RemixUiSolidityUmlGen ({ plugin, updatedSvg, loading }: RemixUiSolidityUmlGenProps) {
  const [showViewer, setShowViewer] = useState(false)
  const [svgPayload, setSVGPayload] = useState<string>('')
  const [validSvg, setValidSvg] = useState(false)



  useEffect(() => {
    setValidSvg (updatedSvg.startsWith('<?xml') && updatedSvg.includes('<svg')) 
    setShowViewer(updatedSvg.startsWith('<?xml') && updatedSvg.includes('<svg'))
  }
  , [updatedSvg])

  const buttons: ButtonAction[] = [
    { 
      buttonText: 'Download as PDF',
      svgValid: () => validSvg,
      action: () => console.log('generated!!')
    },
    { 
      buttonText: 'Download as PNG',
      svgValid: () => validSvg,
      action: () => console.log('generated!!')
    }
  ]

  const DefaultInfo = () => (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5">
      <h2 className="h2"><p>To view your contract as a Uml Diragram</p></h2>
      <h3 className="h3"><p>Right Click on your contract file (Usually ends with .sol)</p></h3>
      <h3 className="h3 text-left"><p>Click on Generate UML</p></h3>
    </div>
  )
  const Display = () => (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="d-flex justify-center align-content-center mb-5">
        {/* <ActionButtons buttons={buttons}/> */}
      </div>
      <div id="umlImageHolder" className="justify-content-center align-items-center d-flex w-100">
        { validSvg && showViewer ? (
          <TransformWrapper>
            <TransformComponent>
              <img 
                src={`data:image/svg+xml;base64,${btoa(plugin.updatedSvg ?? svgPayload)}`}
                width={900}
                height={'auto'}
              />
            </TransformComponent>
          </TransformWrapper>
        ) : loading ? <div className="justify-content-center align-items-center d-flex mx-auto my-auto">
            <i className="fas fa-spinner fa-spin fa-4x"></i>
          </div> : <DefaultInfo />}
      </div>
    </div>
  )
  return (<>
    { <Display /> }
    </>
  )
}

export default RemixUiSolidityUmlGen