import React, { useState } from 'react'
import Draggable from 'react-draggable'

interface IRemixDragBarUi {
  refObject: React.MutableRefObject<any>;
  setHideStatus: (hide: boolean) => void;
}

const DragBar = (props: IRemixDragBarUi) => {
  const [dragState, setDragState] = useState<boolean>(false)
  const [dragBarPos, setDragBarPos] = useState<number>(0)

  function stopDrag (e: MouseEvent, data: any) {
    console.log(data)
    setDragState(false)
    props.refObject.current.style.width = (320 + data.x) + 'px'
    console.log(props.refObject.current.offsetWidth)
    if ((320 + data.x) < 250) {
      props.setHideStatus(true)
      setDragBarPos(41 - 360)
    } else {
      props.setHideStatus(false)
      setDragBarPos(props.refObject.current.offsetWidth - 320)
    }
  }

  function startDrag (e: MouseEvent, data: any) {
    console.log('start')
    setDragState(true)
  }
  return <Draggable position={{ x: dragBarPos, y: 0 }} onStart={startDrag} onStop={stopDrag} axis="x">
    <div className={`dragbar ${dragState ? 'ondrag' : ''}`}></div>
  </Draggable>
}

export default DragBar
