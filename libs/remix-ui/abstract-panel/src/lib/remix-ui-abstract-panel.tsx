import React, { useEffect, useState } from 'react' // eslint-disable-line
import './remix-ui-abstract-panel.module.css';
import parse from 'html-react-parser'

/* eslint-disable-next-line */
export interface RemixUiAbstractPanelProps {
  reactView: any,
  plugin: any
}

export function RemixUiAbstractPanel(props: RemixUiAbstractPanelProps) {

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log({ activePlugin: props.plugin.active })
  },[props.plugin.active])

  useEffect(() => {
      Object.keys(props.plugin.contents).map((key: string) => {
        const view = props.plugin.contents[key]

        view.addEventListener('load', () => {
          setLoading(true)
        })
        setLoading(false)
      })
    }
  , [loading])

  return (
    <div id="plugins" className="plugins">
      {
        Object.keys(props.plugin.contents).map((key: string, index: number) => {
          
          const plugin = props.plugin.contents[key]
          const active = props.plugin.active === key
          console.log({ plugin: plugin.id, active: props.plugin.active })

          return (
            <div className="plugItIn" key={ index }>
              {loading && (
                 <div className="d-flex justify-content-center align-items-center">
                 <div className="spinner-border" role="status">
                   <span className="sr-only">Loading...</span>
                 </div>
               </div>
              )}
            </div>
          )
        })
      }
    </div>
  )
}

export default RemixUiAbstractPanel;
