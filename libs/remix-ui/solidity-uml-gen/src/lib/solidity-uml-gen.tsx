import { CustomTooltip } from '@remix-ui/helper'
import React, { Fragment, useEffect, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { ISolidityUmlGen } from '../types'
import './css/solidity-uml-gen.css'
export interface RemixUiSolidityUmlGenProps {
  plugin?: ISolidityUmlGen
  updatedSvg?: string
  loading?: boolean
  themeSelected?: string
}

type ButtonAction = {
  svgValid: () => boolean
  action: () => void
  buttonText: string
  icon?: string
  customcss?: string
}

interface ActionButtonsProps {
  buttons: ButtonAction[]
}

const ActionButtons = ({ buttons }: ActionButtonsProps) => (
  <>
    {buttons.map(btn => (
      <CustomTooltip
        key={btn.buttonText}
        placement="top"
        tooltipText={btn.buttonText}
        tooltipId={btn.buttonText}
      >
        <button
          key={btn.buttonText}
          className={`btn btn-primary btn-sm rounded-circle ${btn.customcss}`}
          disabled={!btn.svgValid}
          onClick={btn.action}
        >
          <i className={btn.icon}></i>
        </button>
      </CustomTooltip>
    ))}
  </>
)

export function RemixUiSolidityUmlGen ({ plugin, updatedSvg, loading, themeSelected }: RemixUiSolidityUmlGenProps) {
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
      action: () => console.log('generated!!'),
      icon: 'fa mr-1 pt-1 pb-1 fa-file'
    },
    { 
      buttonText: 'Download as PNG',
      svgValid: () => validSvg,
      action: () => console.log('generated!!'),
      icon: 'fa fa-picture-o'
    }
  ]

  const DefaultInfo = () => (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5">
      <h2 className="h2 align-self-start"><p>To view your contract as a Uml Diragram</p></h2>
      <h3 className="h4 align-self-start"><p>Right Click on your contract file (Usually ends with .sol)</p></h3>
      <h3 className="h4 align-self-start"><p>Click on Generate UML</p></h3>
    </div>
  )
  const Display = () => {
    const invert = themeSelected === 'dark' ? 'invert(1)' : 'invert(0)'
    return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div id="umlImageHolder">
        { validSvg && showViewer ? (
          <TransformWrapper
            initialScale={1}
          >
            {
              ({ zoomIn, zoomOut, resetTransform }) => (
                <Fragment>
                  <div className="position-relative">
                    <button className="btn position-absolute top-0 end-100 translate-middle btn-sm mr-1 rounded-circle btn-success" onClick={() => zoomIn()}>+</button>
                    <button className="btn position-absolute top-0 end-100 translate-middle btn-sm mr-1 rounded-circle btn-warning" onClick={() => zoomOut()}>-</button>
                    <button className="btn position-absolute top-0 end-100 translate-middle btn-sm mr-1 rounded-circle btn-danger" onClick={() => resetTransform()}>X</button>
                    <ActionButtons buttons={buttons}/>
                  </div>
                  <TransformComponent>
                    <img 
                      src={`data:image/svg+xml;base64,${btoa(plugin.updatedSvg ?? svgPayload)}`}
                      width={950}
                      height={'auto'}
                      style={{ filter: invert }}
                    />
                </TransformComponent>
                </Fragment>
              )
            }
          </TransformWrapper>
        ) : loading ? <div className="justify-content-center align-items-center d-flex  mx-auto my-auto">
            <i className="fas fa-spinner fa-spin fa-4x"></i>
          </div> : <DefaultInfo />}
      </div>
    </div>
  )}
  return (<>
    { <Display /> }
    </>
  )
}

export default RemixUiSolidityUmlGen