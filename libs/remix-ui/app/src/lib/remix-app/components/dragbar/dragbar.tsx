import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import './dragbar.css'

interface IRemixDragBarUi {
  refObject: React.MutableRefObject<any>;
  setHideStatus: (hide: boolean) => void;
  hidden: boolean
  minWidth: number
}

const DragBar = (props: IRemixDragBarUi) => {
  const [dragState, setDragState] = useState<boolean>(false)
  const [dragBarPosX, setDragBarPosX] = useState<number>(0)
  const [offset, setOffSet] = useState<number>(0)
  const nodeRef = React.useRef(null) // fix for strictmode

  useEffect(() => {
    setDragBarPosX(offset + (props.hidden ? 0 : props.refObject.current.offsetWidth))
  }, [props.hidden, offset])

  const handleResize = () => {
    setOffSet(props.refObject.current.offsetLeft)
    setDragBarPosX(props.refObject.current.offsetLeft + props.refObject.current.offsetWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    // TODO: not a good way to wait on the ref doms element to be rendered of course
    setTimeout(() =>
      handleResize(), 2000)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function stopDrag (e: MouseEvent, data: any) {
    setDragState(false)
    if (data.x < props.minWidth) {
      setDragBarPosX(offset)
      props.setHideStatus(true)
    } else {
      props.refObject.current.style.width = (data.x - offset) + 'px'
      props.setHideStatus(false)
      setDragBarPosX(offset + props.refObject.current.offsetWidth)
    }
  }

  function startDrag () {
    setDragState(true)
  }
  return <>
    <div className={`overlay ${dragState ? '' : 'd-none'}`} ></div>
    <Draggable nodeRef={nodeRef} position={{ x: dragBarPosX, y: 0 }} onStart={startDrag} onStop={stopDrag} axis="x">
      <div ref={nodeRef} className={`dragbar ${dragState ? 'ondrag' : ''}`}></div>
    </Draggable>
  </>
}

export default DragBar
