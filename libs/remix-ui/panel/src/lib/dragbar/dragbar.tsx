// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import './dragbar.css'

interface IRemixDragBarUi {
  refObject: React.MutableRefObject<any>;
  setHideStatus: (hide: boolean) => void;
  hidden: boolean
  minHeight?: number
}

const DragBar = (props: IRemixDragBarUi) => {
  const [dragState, setDragState] = useState<boolean>(false)
  const [dragBarPosY, setDragBarPosY] = useState<number>(0)
  const nodeRef = React.useRef(null) // fix for strictmode

  function stopDrag (e: MouseEvent, data: any) {
    const h = window.innerHeight - data.y
    props.refObject.current.setAttribute('style', `height: ${h}px;`)
    setDragBarPosY(window.innerHeight - props.refObject.current.offsetHeight)
    setDragState(false)
    props.setHideStatus(false)
  }
  const handleResize = () => {
    setDragBarPosY(window.innerHeight - props.refObject.current.offsetHeight)
  }

  useEffect(() => {
    handleResize()
  }, [props.hidden])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    // TODO: not a good way to wait on the ref doms element to be rendered of course
    setTimeout(() =>
      handleResize(), 2000)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
