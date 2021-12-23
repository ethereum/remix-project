import React, { useEffect, useRef, useState } from 'react' // eslint-disable-line

const SidePanelElement = (props: any) => {
    const sidePanelRef = useRef(null)
    useEffect(() => {
        if (sidePanelRef.current) {
          if (props.render) {
            sidePanelRef.current.appendChild(props.render)
          }
        }
      }, [])

      return <div ref={sidePanelRef}></div>
}

export default SidePanelElement