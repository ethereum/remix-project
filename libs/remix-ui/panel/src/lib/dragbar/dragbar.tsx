import React, { useEffect, useLayoutEffect, useState } from 'react'
import Draggable from 'react-draggable'
import './dragbar.css'

interface IRemixDragBarUi {
  refObject: React.MutableRefObject<any>;
  setHideStatus: (hide: boolean) => void;
  hidden: boolean
  minHeight: number
}

const DragBar = (props: IRemixDragBarUi) => {
  const [dragState, setDragState] = useState<boolean>(false)
  const [dragBarPosY, setDragBarPosY] = useState<number>(0)
  const [offset, setOffSet] = useState<number>(0)
  const nodeRef = React.useRef(null) // fix for strictmode

  useEffect(() => {
    // arbitrary time out to wait the the UI to be completely done
    setTimeout(() => {
      console.log(window.innerHeight)
      console.log(props.refObject.current.offsetTop)
      setOffSet(props.refObject.current.offsetTop)
      setDragBarPosY(props.refObject.current.offsetTop)
    }, 1000)
  }, [])

  useEffect(() => {
    // setDragBarPosX(offset + (props.hidden ? 0 : props.refObject.current.offsetHeight))
  }, [props.hidden, offset])

  function stopDrag (e: MouseEvent, data: any) {
    setDragState(false)
  }

  function startDrag () {
    setDragState(true)
  }
  return <>
    <div className={`overlay ${dragState ? '' : 'd-none'}`} ></div>
    <Draggable nodeRef={nodeRef} position={{ x: 0, y: dragBarPosY }} onStart={startDrag} onStop={stopDrag} axis="y">
      <div ref={nodeRef} className={`dragbar_terminal ${dragState ? 'ondrag' : ''}`}></div>
    </Draggable>
  </>
}

export default DragBar
