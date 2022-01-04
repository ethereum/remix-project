import React, { useEffect, useRef, useState } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog'
import { ModalDialogProps } from 'libs/remix-ui/modal-dialog/src/lib/types'
import { ModalTypes } from '../../types'

interface ModalWrapperProps extends ModalDialogProps {
    modalType?: ModalTypes
    defaultValue?: string
}

const ModalWrapper = (props: ModalWrapperProps) => {
  const [state, setState] = useState<ModalDialogProps>()
  const [modalInput, setModalInput] = useState<string>('')
  const ref = useRef()

  const onFinishPrompt = async () => {
    if (ref.current === undefined) {
      props.okFn()
    } else {
      // @ts-ignore: Object is possibly 'null'.
      props.okFn(ref.current.value)
    }
  }

  const createModalMessage = (defaultValue: string) => {
    return (
      <>
        {props.message}
        <input type={props.modalType === ModalTypes.password ? 'password' : 'text'} defaultValue={defaultValue} data-id="modalDialogCustomPromp" ref={ref} className="form-control" /></>
    )
  }

  useEffect(() => {
    if (props.modalType) {
      switch (props.modalType) {
        case ModalTypes.prompt:
        case ModalTypes.password:
          setState({
            ...props,
            okFn: onFinishPrompt,
            message: createModalMessage(props.defaultValue)
          })
          break
        default:
          setState({ ...props })
          break
      }
    } else {
      setState({ ...props })
    }
  }, [props])

  return (
    <ModalDialog id={props.id} {...state} handleHide={props.handleHide} />
  )
}
export default ModalWrapper
