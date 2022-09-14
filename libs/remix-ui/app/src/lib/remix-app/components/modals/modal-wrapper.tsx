import React, { useEffect, useRef, useState } from 'react'
import { ModalDialog, ModalDialogProps, ValidationResult } from '@remix-ui/modal-dialog'
import { ModalTypes } from '../../types'

interface ModalWrapperProps extends ModalDialogProps {
    modalType?: ModalTypes
    defaultValue?: string
}

const ModalWrapper = (props: ModalWrapperProps) => {
  const [state, setState] = useState<ModalDialogProps>()
  const ref = useRef()
  const data = useRef()

  const onFinishPrompt = async () => {
    if (ref.current === undefined) {
      onOkFn()
    } else {
      // @ts-ignore: Object is possibly 'null'.
      (props.okFn) ? props.okFn(ref.current.value) : props.resolve(ref.current.value)
    }
  }

  const onOkFn = async () => {
    (props.okFn) ? props.okFn(data.current) : props.resolve(data.current || true)
  }

  const onCancelFn = async () => {
    (props.cancelFn) ? props.cancelFn() : props.resolve(false)
  }

  const onInputChanged = (event) => {
    if (props.validationFn) {
      const validation = props.validationFn(event.target.value)
      setState(prevState => {
        return { ...prevState, message: createModalMessage(props.defaultValue, validation), validation }
      })
    }
  }

  const createModalMessage = (defaultValue: string, validation: ValidationResult) => {
    return (
      <>
        {props.message}
        <input onChange={onInputChanged} type={props.modalType === ModalTypes.password ? 'password' : 'text'} defaultValue={defaultValue} data-id="modalDialogCustomPromp" ref={ref} className="form-control" />
        {!validation.valid && <span className='text-warning'>{validation.message}</span>}
        </>
      )
  }

  useEffect(() => {
    data.current = props.data
    if (props.modalType) {
      switch (props.modalType) {
        case ModalTypes.prompt:
        case ModalTypes.password:
          setState({
            ...props,
            okFn: onFinishPrompt,
            cancelFn: onCancelFn,
            message: createModalMessage(props.defaultValue, { valid: true })
          })
          break
        default:
          setState({
            ...props,
            okFn: onOkFn,
            cancelFn: onCancelFn
          })
          break
      }
    } else {
      setState({
        ...props,
        okFn: onOkFn,
        cancelFn: onCancelFn
      })
    }
  }, [props])

  // reset the message and input if any, so when the modal is shown again it doesn't show the previous value.
  const handleHide = () => {
    setState(prevState => {
      return { ...prevState, message: '' }
    })
    props.handleHide()
  }

  return (
    <ModalDialog id={props.id} {...state} handleHide={handleHide} />
  )
}
export default ModalWrapper
